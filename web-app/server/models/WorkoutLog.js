const mongoose = require('mongoose');

/**
 * WorkoutLog Schema
 * Stores user workout performance data linked to videos and exercises
 */
const workoutLogSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
    default: Date.now
  },
  routineId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine'
  },
  videoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true
  },
  segmentTimestamp: {
    type: Number
  }, // Optional: links log to a specific AI-detected segment
  exerciseName: {
    type: String,
    required: true
  }, // Can be from segment or manually entered
  sets: [{
    reps: {
      type: Number
    },
    weight: {
      type: Number
    }
    // E.g., { reps: 12, weight: 20 }, { reps: 10, weight: 20 }
  }],
  notes: {
    type: String
  }
}, { timestamps: true });

// Index for faster queries
workoutLogSchema.index({ videoId: 1, date: -1 });
workoutLogSchema.index({ date: -1 });

const WorkoutLog = mongoose.model('WorkoutLog', workoutLogSchema);
module.exports = WorkoutLog;

