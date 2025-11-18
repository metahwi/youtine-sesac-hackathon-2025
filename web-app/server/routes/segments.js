const express = require('express');
const router = express.Router();
const ExerciseSegment = require('../models/ExerciseSegment');
const Video = require('../models/Video');
const { createLogger } = require('../utils/logger');

const logger = createLogger('segments');

/**
 * GET /api/segments
 * Get all segments (with optional filters)
 * Query params:
 *   - search: Filter by exercise name (case-insensitive)
 *   - muscleGroup: Filter by target muscle
 *   - videoId: Get segments from specific video
 */
router.get('/', async (req, res) => {
  try {
    const { search, muscleGroup, videoId } = req.query;

    // Build query
    const query = {};
    if (search) {
      query.exerciseName = { $regex: search, $options: 'i' };
    }
    if (muscleGroup) {
      query.targetMuscles = muscleGroup;
    }
    if (videoId) {
      query.sourceVideoId = videoId;
    }

    const segments = await ExerciseSegment.find(query)
      .populate('sourceVideoId', 'title url thumbnail duration')
      .sort({ createdAt: -1 });

    logger.info(`Fetched ${segments.length} segments`);
    res.json(segments);
  } catch (error) {
    logger.error('Error fetching segments:', error);
    res.status(500).json({ error: 'Failed to fetch segments' });
  }
});

/**
 * GET /api/segments/:id
 * Get single segment by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const segment = await ExerciseSegment.findById(req.params.id)
      .populate('sourceVideoId');

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    res.json(segment);
  } catch (error) {
    logger.error('Error fetching segment:', error);
    res.status(500).json({ error: 'Failed to fetch segment' });
  }
});

/**
 * POST /api/segments
 * Manually create a new segment (Enhancement 1: Manual Editor)
 * Body: { sourceVideoId, exerciseName, startTime, endTime, targetMuscles }
 */
router.post('/', async (req, res) => {
  try {
    const { sourceVideoId, exerciseName, startTime, endTime, targetMuscles } = req.body;

    // Validation
    if (!sourceVideoId || !exerciseName || startTime === undefined || endTime === undefined) {
      return res.status(400).json({
        error: 'Missing required fields: sourceVideoId, exerciseName, startTime, endTime'
      });
    }

    if (startTime >= endTime) {
      return res.status(400).json({ error: 'startTime must be less than endTime' });
    }

    // Get source video for thumbnail
    const video = await Video.findById(sourceVideoId);
    if (!video) {
      return res.status(404).json({ error: 'Source video not found' });
    }

    // Create segment
    const segment = new ExerciseSegment({
      sourceVideoId,
      exerciseName,
      startTime,
      endTime,
      targetMuscles: targetMuscles || [],
      thumbnailUrl: video.thumbnail
    });

    await segment.save();

    // Populate source video
    await segment.populate('sourceVideoId', 'title url thumbnail duration');

    logger.success(`Manually created segment: ${segment._id}`);
    res.status(201).json(segment);
  } catch (error) {
    logger.error('Error creating segment:', error);
    res.status(500).json({ error: 'Failed to create segment' });
  }
});

/**
 * PUT /api/segments/:id
 * Manually update an existing segment (Enhancement 1: Manual Editor)
 * Body: { exerciseName?, startTime?, endTime?, targetMuscles? }
 */
router.put('/:id', async (req, res) => {
  try {
    const { exerciseName, startTime, endTime, targetMuscles } = req.body;

    // Find segment
    const segment = await ExerciseSegment.findById(req.params.id);
    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    // Update fields
    if (exerciseName !== undefined) segment.exerciseName = exerciseName;
    if (startTime !== undefined) segment.startTime = startTime;
    if (endTime !== undefined) segment.endTime = endTime;
    if (targetMuscles !== undefined) segment.targetMuscles = targetMuscles;

    // Validate times
    if (segment.startTime >= segment.endTime) {
      return res.status(400).json({ error: 'startTime must be less than endTime' });
    }

    await segment.save();
    await segment.populate('sourceVideoId', 'title url thumbnail duration');

    logger.info(`Updated segment: ${segment._id}`);
    res.json(segment);
  } catch (error) {
    logger.error('Error updating segment:', error);
    res.status(500).json({ error: 'Failed to update segment' });
  }
});

/**
 * DELETE /api/segments/:id
 * Delete a segment
 */
router.delete('/:id', async (req, res) => {
  try {
    const segment = await ExerciseSegment.findByIdAndDelete(req.params.id);

    if (!segment) {
      return res.status(404).json({ error: 'Segment not found' });
    }

    logger.info(`Deleted segment: ${req.params.id}`);
    res.json({ message: 'Segment deleted successfully' });
  } catch (error) {
    logger.error('Error deleting segment:', error);
    res.status(500).json({ error: 'Failed to delete segment' });
  }
});

/**
 * GET /api/segments/meta/muscle-groups
 * Get list of all unique muscle groups
 */
router.get('/meta/muscle-groups', async (req, res) => {
  try {
    const muscleGroups = await ExerciseSegment.distinct('targetMuscles');
    res.json(muscleGroups.sort());
  } catch (error) {
    logger.error('Error fetching muscle groups:', error);
    res.status(500).json({ error: 'Failed to fetch muscle groups' });
  }
});

module.exports = router;
