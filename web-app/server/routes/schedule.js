const express = require('express');
const router = express.Router();
const ScheduledRoutine = require('../models/ScheduledRoutine');
const Routine = require('../models/Routine');

/**
 * POST /api/schedule
 * Schedule a routine for a specific date
 */
router.post('/', async (req, res) => {
  try {
    const { routineId, date, notes } = req.body;

    if (!routineId || !date) {
      return res.status(400).json({ error: 'routineId and date are required' });
    }

    // Verify routine exists
    const routine = await Routine.findById(routineId);
    if (!routine) {
      return res.status(404).json({ error: 'Routine not found' });
    }

    // Create scheduled routine
    const scheduledRoutine = new ScheduledRoutine({
      routine: routineId,
      date: new Date(date),
      notes: notes || ''
    });

    await scheduledRoutine.save();

    // Populate routine details
    await scheduledRoutine.populate('routine');

    res.status(201).json(scheduledRoutine);
  } catch (error) {
    console.error('Error scheduling routine:', error);
    res.status(500).json({ error: 'Failed to schedule routine' });
  }
});

/**
 * GET /api/schedule
 * Get all scheduled routines (with optional date filtering)
 * Query params:
 *   - startDate: Start of date range (ISO string)
 *   - endDate: End of date range (ISO string)
 *   - routineId: Filter by specific routine
 */
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, routineId } = req.query;

    const query = {};

    // Date range filter
    if (startDate || endDate) {
      query.date = {};
      if (startDate) {
        query.date.$gte = new Date(startDate);
      }
      if (endDate) {
        query.date.$lte = new Date(endDate);
      }
    }

    // Routine filter
    if (routineId) {
      query.routine = routineId;
    }

    const scheduledRoutines = await ScheduledRoutine.find(query)
      .populate('routine')
      .sort({ date: 1 });

    res.status(200).json(scheduledRoutines);
  } catch (error) {
    console.error('Error fetching scheduled routines:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled routines' });
  }
});

/**
 * GET /api/schedule/:id
 * Get a specific scheduled routine
 */
router.get('/:id', async (req, res) => {
  try {
    const scheduledRoutine = await ScheduledRoutine.findById(req.params.id)
      .populate('routine');

    if (!scheduledRoutine) {
      return res.status(404).json({ error: 'Scheduled routine not found' });
    }

    res.status(200).json(scheduledRoutine);
  } catch (error) {
    console.error('Error fetching scheduled routine:', error);
    res.status(500).json({ error: 'Failed to fetch scheduled routine' });
  }
});

/**
 * PUT /api/schedule/:id
 * Update a scheduled routine (mark as completed, update notes, change date)
 */
router.put('/:id', async (req, res) => {
  try {
    const { completed, notes, date } = req.body;

    const updateData = {};
    if (completed !== undefined) updateData.completed = completed;
    if (notes !== undefined) updateData.notes = notes;
    if (date) updateData.date = new Date(date);

    const scheduledRoutine = await ScheduledRoutine.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    ).populate('routine');

    if (!scheduledRoutine) {
      return res.status(404).json({ error: 'Scheduled routine not found' });
    }

    res.status(200).json(scheduledRoutine);
  } catch (error) {
    console.error('Error updating scheduled routine:', error);
    res.status(500).json({ error: 'Failed to update scheduled routine' });
  }
});

/**
 * DELETE /api/schedule/:id
 * Delete a scheduled routine
 */
router.delete('/:id', async (req, res) => {
  try {
    const scheduledRoutine = await ScheduledRoutine.findByIdAndDelete(req.params.id);

    if (!scheduledRoutine) {
      return res.status(404).json({ error: 'Scheduled routine not found' });
    }

    res.status(200).json({ message: 'Scheduled routine deleted successfully' });
  } catch (error) {
    console.error('Error deleting scheduled routine:', error);
    res.status(500).json({ error: 'Failed to delete scheduled routine' });
  }
});

/**
 * GET /api/schedule/calendar/:year/:month
 * Get scheduled routines for a specific month (for calendar view)
 */
router.get('/calendar/:year/:month', async (req, res) => {
  try {
    const year = parseInt(req.params.year);
    const month = parseInt(req.params.month);

    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);

    const scheduledRoutines = await ScheduledRoutine.find({
      date: { $gte: startDate, $lte: endDate }
    }).populate('routine');

    // Group by date
    const calendarData = {};

    scheduledRoutines.forEach(scheduled => {
      const dateKey = scheduled.date.toISOString().split('T')[0]; // YYYY-MM-DD

      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          date: dateKey,
          routines: []
        };
      }

      calendarData[dateKey].routines.push({
        _id: scheduled._id,
        routine: scheduled.routine,
        completed: scheduled.completed,
        notes: scheduled.notes
      });
    });

    // Convert to array
    const calendarArray = Object.values(calendarData).sort((a, b) =>
      new Date(a.date) - new Date(b.date)
    );

    res.status(200).json({
      year,
      month,
      scheduledDays: calendarArray
    });
  } catch (error) {
    console.error('Error fetching calendar schedule:', error);
    res.status(500).json({ error: 'Failed to fetch calendar schedule' });
  }
});

module.exports = router;

