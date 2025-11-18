const mongoose = require('mongoose');

/**
 * Routine Schema
 * Represents a workout routine containing a mashup of exercise segments
 * UPDATED: Now references ExerciseSegment instead of full videos
 */
const routineSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  description: {
    type: String,
    trim: true,
    default: ''
  },
  // CHANGED: segments instead of videos (enables mashup functionality)
  segments: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'ExerciseSegment'
  }],
  // Keep legacy videos field for backward compatibility (optional)
  videos: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Video'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Routine', routineSchema);

