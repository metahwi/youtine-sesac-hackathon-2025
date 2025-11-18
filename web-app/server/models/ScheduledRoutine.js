const mongoose = require('mongoose');

/**
 * ScheduledRoutine Schema
 * Represents a routine scheduled for a specific date
 */
const scheduledRoutineSchema = new mongoose.Schema({
  routine: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Routine',
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  completed: {
    type: Boolean,
    default: false
  },
  notes: {
    type: String,
    default: ''
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Index for efficient date queries
scheduledRoutineSchema.index({ date: 1 });
scheduledRoutineSchema.index({ routine: 1, date: 1 });

const ScheduledRoutine = mongoose.model('ScheduledRoutine', scheduledRoutineSchema);

module.exports = ScheduledRoutine;

