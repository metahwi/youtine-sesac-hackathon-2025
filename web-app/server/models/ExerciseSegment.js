const mongoose = require('mongoose');

/**
 * ExerciseSegment Schema
 * Represents an atomized exercise clip from a YouTube video
 * Core model for the "mashup" feature
 */
const exerciseSegmentSchema = new mongoose.Schema({
  // Reference to source video
  sourceVideoId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video',
    required: true,
    index: true  // For faster queries
  },

  // Exercise details
  exerciseName: {
    type: String,
    required: true,
    trim: true,
    index: true  // For search queries
  },

  // Time boundaries (in seconds)
  startTime: {
    type: Number,
    required: true,
    min: 0
  },
  endTime: {
    type: Number,
    required: true,
    validate: {
      validator: function(value) {
        return value > this.startTime;
      },
      message: 'endTime must be greater than startTime'
    }
  },

  // Metadata
  targetMuscles: [{
    type: String,
    trim: true,
    index: true  // For muscle group filtering
  }],

  // Cached thumbnail from source video (for performance)
  thumbnailUrl: {
    type: String,
    required: true
  },

  // Computed duration helper (in seconds)
  duration: {
    type: Number
  },

  createdAt: {
    type: Date,
    default: Date.now
  }
});

// Compound index for efficient queries
exerciseSegmentSchema.index({ exerciseName: 1, targetMuscles: 1 });
exerciseSegmentSchema.index({ sourceVideoId: 1, startTime: 1 });

// Pre-save hook to calculate duration
exerciseSegmentSchema.pre('save', function(next) {
  this.duration = this.endTime - this.startTime;
  next();
});

module.exports = mongoose.model('ExerciseSegment', exerciseSegmentSchema);
