const express = require('express');
const router = express.Router();
const WorkoutLog = require('../models/WorkoutLog');
const Video = require('../models/Video');

/**
 * POST /api/logs
 * Create a new workout log entry
 */
router.post('/', async (req, res) => {
  try {
    const { videoId, exerciseName, sets, notes, routineId, segmentTimestamp } = req.body;

    // Validation
    if (!videoId || !exerciseName) {
      return res.status(400).json({ error: 'videoId and exerciseName are required' });
    }

    // Verify video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Create new workout log
    const workoutLog = new WorkoutLog({
      videoId,
      exerciseName,
      sets: sets || [],
      notes: notes || '',
      routineId: routineId || null,
      segmentTimestamp: segmentTimestamp || null,
      date: new Date()
    });

    await workoutLog.save();
    
    // Populate video details for response
    await workoutLog.populate('videoId', 'title thumbnail');
    
    console.log(`Workout log created: ${workoutLog._id} for exercise "${exerciseName}"`);
    res.status(201).json(workoutLog);
  } catch (error) {
    console.error('Error creating workout log:', error);
    res.status(500).json({ error: 'Failed to create workout log' });
  }
});

/**
 * GET /api/logs
 * Retrieve workout logs with optional filtering
 * Query params:
 *   - videoId: Filter by video
 *   - exerciseName: Filter by exercise name
 *   - startDate: Filter logs after this date
 *   - endDate: Filter logs before this date
 *   - limit: Number of logs to return (default: 100)
 */
router.get('/', async (req, res) => {
  try {
    const { videoId, exerciseName, startDate, endDate, limit = 100 } = req.query;
    
    // Build query
    const query = {};
    
    if (videoId) {
      query.videoId = videoId;
    }
    
    if (exerciseName) {
      query.exerciseName = exerciseName;
    }
    
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }
    
    // Fetch logs
    const logs = await WorkoutLog.find(query)
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('videoId', 'title thumbnail duration')
      .populate('routineId', 'name');
    
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching workout logs:', error);
    res.status(500).json({ error: 'Failed to fetch workout logs' });
  }
});

/**
 * GET /api/logs/:id
 * Get a single workout log by ID
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const log = await WorkoutLog.findById(id)
      .populate('videoId', 'title thumbnail duration')
      .populate('routineId', 'name');
    
    if (!log) {
      return res.status(404).json({ error: 'Workout log not found' });
    }
    
    res.status(200).json(log);
  } catch (error) {
    console.error('Error fetching workout log:', error);
    res.status(500).json({ error: 'Failed to fetch workout log' });
  }
});

/**
 * PUT /api/logs/:id
 * Update a workout log
 */
router.put('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { sets, notes, exerciseName } = req.body;
    
    const updateData = {};
    if (sets !== undefined) updateData.sets = sets;
    if (notes !== undefined) updateData.notes = notes;
    if (exerciseName !== undefined) updateData.exerciseName = exerciseName;
    
    const updatedLog = await WorkoutLog.findByIdAndUpdate(
      id,
      updateData,
      { new: true }
    ).populate('videoId', 'title thumbnail duration');
    
    if (!updatedLog) {
      return res.status(404).json({ error: 'Workout log not found' });
    }
    
    res.status(200).json(updatedLog);
  } catch (error) {
    console.error('Error updating workout log:', error);
    res.status(500).json({ error: 'Failed to update workout log' });
  }
});

/**
 * DELETE /api/logs/:id
 * Delete a workout log
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    const deletedLog = await WorkoutLog.findByIdAndDelete(id);
    
    if (!deletedLog) {
      return res.status(404).json({ error: 'Workout log not found' });
    }
    
    res.status(200).json({ message: 'Workout log deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout log:', error);
    res.status(500).json({ error: 'Failed to delete workout log' });
  }
});

/**
 * GET /api/logs/exercise/:exerciseName/history
 * Get workout history for a specific exercise
 * Returns logs sorted by date with performance trends
 */
router.get('/exercise/:exerciseName/history', async (req, res) => {
  try {
    const { exerciseName } = req.params;
    const { limit = 10 } = req.query;
    
    const logs = await WorkoutLog.find({ exerciseName })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .populate('videoId', 'title thumbnail');
    
    res.status(200).json(logs);
  } catch (error) {
    console.error('Error fetching exercise history:', error);
    res.status(500).json({ error: 'Failed to fetch exercise history' });
  }
});

module.exports = router;

