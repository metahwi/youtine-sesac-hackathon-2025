const express = require('express');
const router = express.Router();
const WorkoutLog = require('../models/WorkoutLog');

/**
 * GET /api/dashboard/stats
 * Get aggregated workout statistics
 */
router.get('/stats', async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now);
    startOfWeek.setDate(now.getDate() - now.getDay());
    
    // Total workouts this month
    const workoutsThisMonth = await WorkoutLog.countDocuments({
      date: { $gte: startOfMonth }
    });
    
    // Total workouts this week
    const workoutsThisWeek = await WorkoutLog.countDocuments({
      date: { $gte: startOfWeek }
    });
    
    // Total workouts all time
    const totalWorkouts = await WorkoutLog.countDocuments();
    
    // Calculate total sets and reps this month
    const monthLogs = await WorkoutLog.find({
      date: { $gte: startOfMonth }
    });
    
    let totalSetsThisMonth = 0;
    let totalRepsThisMonth = 0;
    
    monthLogs.forEach(log => {
      if (log.sets && Array.isArray(log.sets)) {
        totalSetsThisMonth += log.sets.length;
        log.sets.forEach(set => {
          if (set.reps) {
            totalRepsThisMonth += set.reps;
          }
        });
      }
    });
    
    // Calculate current workout streak
    const streak = await calculateWorkoutStreak();
    
    // Get most trained exercises this month
    const topExercises = await WorkoutLog.aggregate([
      { $match: { date: { $gte: startOfMonth } } },
      { $group: { _id: '$exerciseName', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);
    
    const stats = {
      workoutsThisMonth,
      workoutsThisWeek,
      totalWorkouts,
      totalSetsThisMonth,
      totalRepsThisMonth,
      currentStreak: streak,
      topExercises: topExercises.map(e => ({
        name: e._id,
        count: e.count
      }))
    };
    
    res.status(200).json(stats);
  } catch (error) {
    console.error('Error fetching dashboard stats:', error);
    res.status(500).json({ error: 'Failed to fetch dashboard stats' });
  }
});

/**
 * GET /api/dashboard/calendar
 * Get workout calendar data for a specific month
 * Query params:
 *   - year: Year (default: current year)
 *   - month: Month 1-12 (default: current month)
 */
router.get('/calendar', async (req, res) => {
  try {
    const now = new Date();
    const year = parseInt(req.query.year) || now.getFullYear();
    const month = parseInt(req.query.month) || (now.getMonth() + 1);
    
    // Create date range for the month
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59);
    
    // Get all workout logs for the month
    const logs = await WorkoutLog.find({
      date: { $gte: startDate, $lte: endDate }
    }).select('date exerciseName');
    
    // Group by date
    const calendarData = {};
    
    logs.forEach(log => {
      const dateKey = log.date.toISOString().split('T')[0]; // YYYY-MM-DD format
      
      if (!calendarData[dateKey]) {
        calendarData[dateKey] = {
          date: dateKey,
          workoutCount: 0,
          exercises: []
        };
      }
      
      calendarData[dateKey].workoutCount++;
      if (!calendarData[dateKey].exercises.includes(log.exerciseName)) {
        calendarData[dateKey].exercises.push(log.exerciseName);
      }
    });
    
    // Convert to array and sort by date
    const calendarArray = Object.values(calendarData).sort((a, b) => 
      new Date(a.date) - new Date(b.date)
    );
    
    res.status(200).json({
      year,
      month,
      workoutDays: calendarArray
    });
  } catch (error) {
    console.error('Error fetching calendar data:', error);
    res.status(500).json({ error: 'Failed to fetch calendar data' });
  }
});

/**
 * GET /api/dashboard/progress
 * Get progress data for a specific exercise
 * Query params:
 *   - exerciseName: Name of the exercise
 *   - limit: Number of recent logs to return (default: 10)
 */
router.get('/progress', async (req, res) => {
  try {
    const { exerciseName, limit = 10 } = req.query;
    
    if (!exerciseName) {
      return res.status(400).json({ error: 'exerciseName is required' });
    }
    
    const logs = await WorkoutLog.find({ exerciseName })
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .select('date sets notes');
    
    // Calculate progress metrics
    const progressData = logs.reverse().map(log => {
      let maxWeight = 0;
      let totalReps = 0;
      let totalVolume = 0; // weight * reps
      
      if (log.sets && Array.isArray(log.sets)) {
        log.sets.forEach(set => {
          if (set.weight && set.weight > maxWeight) {
            maxWeight = set.weight;
          }
          if (set.reps) {
            totalReps += set.reps;
          }
          if (set.weight && set.reps) {
            totalVolume += set.weight * set.reps;
          }
        });
      }
      
      return {
        date: log.date,
        maxWeight,
        totalReps,
        totalVolume,
        sets: log.sets
      };
    });
    
    res.status(200).json({
      exerciseName,
      progressData
    });
  } catch (error) {
    console.error('Error fetching progress data:', error);
    res.status(500).json({ error: 'Failed to fetch progress data' });
  }
});

/**
 * Helper function to calculate workout streak
 * Returns the number of consecutive days with at least one workout
 */
async function calculateWorkoutStreak() {
  try {
    // Get all unique workout dates, sorted descending
    const logs = await WorkoutLog.find()
      .select('date')
      .sort({ date: -1 });
    
    if (logs.length === 0) {
      return 0;
    }
    
    // Extract unique dates
    const uniqueDates = [...new Set(logs.map(log => 
      log.date.toISOString().split('T')[0]
    ))];
    
    // Check if there's a workout today or yesterday
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    
    const todayStr = today.toISOString().split('T')[0];
    const yesterdayStr = yesterday.toISOString().split('T')[0];
    
    // If no workout today or yesterday, streak is 0
    if (uniqueDates[0] !== todayStr && uniqueDates[0] !== yesterdayStr) {
      return 0;
    }
    
    // Count consecutive days
    let streak = 1;
    let currentDate = new Date(uniqueDates[0]);
    
    for (let i = 1; i < uniqueDates.length; i++) {
      const prevDate = new Date(uniqueDates[i]);
      const dayDiff = Math.floor((currentDate - prevDate) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        streak++;
        currentDate = prevDate;
      } else {
        break;
      }
    }
    
    return streak;
  } catch (error) {
    console.error('Error calculating streak:', error);
    return 0;
  }
}

module.exports = router;

