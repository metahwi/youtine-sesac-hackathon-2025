const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const Video = require('../models/Video');
const ExerciseSegment = require('../models/ExerciseSegment');
const { createLogger } = require('../utils/logger');

const logger = createLogger('routines');

/**
 * POST /api/routines
 * Create a new workout routine
 */
router.post('/', async (req, res) => {
  try {
    const { name, description, segments, videos } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Routine name is required' });
    }

    const newRoutine = new Routine({
      name,
      description: description || '',
      segments: segments || [],  // Accept segments from request
      videos: videos || []         // Keep for backward compatibility
    });

    await newRoutine.save();
    res.status(201).json(newRoutine);

  } catch (error) {
    logger.error('Error creating routine:', error);
    res.status(500).json({ error: 'Failed to create routine' });
  }
});

/**
 * GET /api/routines
 * Retrieve all routines
 */
router.get('/', async (req, res) => {
  try {
    const routines = await Routine.find().sort({ createdAt: -1 });
    res.status(200).json(routines);
  } catch (error) {
    logger.error('Error fetching routines:', error);
    res.status(500).json({ error: 'Failed to fetch routines' });
  }
});

/**
 * GET /api/routines/:id
 * Retrieve a single routine with populated segment details
 * UPDATED: Now populates segments with nested sourceVideoId
 */
router.get('/:id', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id)
      .populate({
        path: 'segments',
        populate: { path: 'sourceVideoId', select: 'title url thumbnail duration' }
      })
      .populate('videos');  // Keep for backward compatibility

    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    res.status(200).json(routine);
  } catch (error) {
    logger.error('Error fetching routine:', error);
    res.status(500).json({ error: 'Failed to fetch routine' });
  }
});

/**
 * GET /api/routines/:id/queue
 * Return a normalized queue of items (segments and/or whole videos)
 * Shape:
 * {
 *   _id,
 *   type: 'segment' | 'video',
 *   exerciseName,
 *   title,
 *   thumbnail,
 *   startTime,
 *   endTime,
 *   duration,
 *   videoId
 * }
 */
router.get('/:id/queue', async (req, res) => {
  try {
    const routine = await Routine.findById(req.params.id)
      .populate({
        path: 'segments',
        populate: { path: 'sourceVideoId', select: 'title url thumbnail duration' }
      })
      .populate('videos');

    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    const queue = [];

    // First, add all segments in the order defined by routine.segments
    const videosWithSegments = new Set();

    (routine.segments || []).forEach((segment) => {
      const video = segment.sourceVideoId;
      if (video && video._id) {
        videosWithSegments.add(video._id.toString());
      }

      const duration = typeof segment.endTime === 'number' && typeof segment.startTime === 'number'
        ? segment.endTime - segment.startTime
        : undefined;

      queue.push({
        _id: segment._id,
        type: 'segment',
        exerciseName: segment.exerciseName,
        title: video?.title || segment.exerciseName,
        thumbnail: video?.thumbnail || segment.thumbnailUrl,
        startTime: segment.startTime,
        endTime: segment.endTime,
        duration,
        videoId: video?._id || null,
      });
    });

    // Then, include any videos that don't have an associated segment in this routine
    (routine.videos || []).forEach((video) => {
      if (!video || !video._id) return;

      const hasSegment = videosWithSegments.has(video._id.toString());
      if (hasSegment) return;

      const duration = typeof video.duration === 'number' ? video.duration : undefined;

      queue.push({
        _id: video._id,
        type: 'video',
        exerciseName: 'Full video',
        title: video.title,
        thumbnail: video.thumbnail,
        startTime: 0,
        endTime: duration,
        duration,
        videoId: video._id,
      });
    });

    res.status(200).json(queue);
  } catch (error) {
    logger.error('Error fetching routine queue:', error);
    res.status(500).json({ error: 'Failed to fetch routine queue' });
  }
});

/**
 * PUT /api/routines/:id
 * Update a routine (add, remove, or reorder segments)
 * UPDATED: Now accepts segments instead of videos
 */
router.put('/:id', async (req, res) => {
  try {
    const { name, description, videos, segments } = req.body;

    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (description !== undefined) updateData.description = description;
    if (videos !== undefined) updateData.videos = videos;  // Backward compatibility
    if (segments !== undefined) updateData.segments = segments;  // NEW: segment support

    const updatedRoutine = await Routine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    )
      .populate({
        path: 'segments',
        populate: { path: 'sourceVideoId', select: 'title url thumbnail duration' }
      })
      .populate('videos');

    if (!updatedRoutine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    res.status(200).json(updatedRoutine);
  } catch (error) {
    logger.error('Error updating routine:', error);
    res.status(500).json({ error: 'Failed to update routine' });
  }
});

/**
 * POST /api/routines/:id/videos
 * Add a video to a routine and ensure there is at least one queue segment for it.
 * - Stores the video in routine.videos (no duplicates)
 * - Optionally creates a default ExerciseSegment representing the full video
 *   and adds it to routine.segments.
 */
router.post('/:id/videos', async (req, res) => {
  try {
    const { videoId } = req.body;

    if (!videoId) {
      return res.status(400).json({ error: 'videoId is required' });
    }

    const routine = await Routine.findById(req.params.id);
    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Ensure video is in routine.videos (no duplicates)
    const videos = routine.videos || [];
    if (!videos.some((id) => id.toString() === videoId.toString())) {
      videos.push(videoId);
      routine.videos = videos;
    }

    // Optionally create a default "full video" segment if none exists for this video in this routine
    const segmentIds = routine.segments || [];
    const existingFullSegment = await ExerciseSegment.findOne({
      _id: { $in: segmentIds },
      sourceVideoId: videoId,
      startTime: 0,
    });

    if (!existingFullSegment) {
      const fullSegment = new ExerciseSegment({
        sourceVideoId: video._id,
        exerciseName: video.title || 'Full video',
        startTime: 0,
        endTime: typeof video.duration === 'number' ? video.duration : 0,
        targetMuscles: [],
        thumbnailUrl: video.thumbnail,
      });

      await fullSegment.save();

      segmentIds.push(fullSegment._id);
      routine.segments = segmentIds;
    }

    await routine.save();

    // Return populated routine so the client has everything needed for the queue UI
    const populatedRoutine = await Routine.findById(routine._id)
      .populate({
        path: 'segments',
        populate: { path: 'sourceVideoId', select: 'title url thumbnail duration' },
      })
      .populate('videos');

    res.status(200).json(populatedRoutine);
  } catch (error) {
    logger.error('Error adding video to routine:', error);
    res.status(500).json({ error: 'Failed to add video to routine' });
  }
});

/**
 * DELETE /api/routines/:id
 * Delete a routine
 */
router.delete('/:id', async (req, res) => {
  try {
    const deletedRoutine = await Routine.findByIdAndDelete(req.params.id);

    if (!deletedRoutine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    res.status(200).json({ message: 'Routine deleted successfully' });
  } catch (error) {
    logger.error('Error deleting routine:', error);
    res.status(500).json({ error: 'Failed to delete routine' });
  }
});

module.exports = router;

