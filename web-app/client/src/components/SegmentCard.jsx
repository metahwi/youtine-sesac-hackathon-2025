import { Play, Plus, Edit, Trash2 } from 'lucide-react';
import { formatDuration } from '../lib/utils';

/**
 * SegmentCard Component
 * Displays an individual exercise segment with thumbnail and metadata
 */
const SegmentCard = ({ segment, onAdd, onPlay, onEdit, onDelete, showAddButton, showEditButton, showDeleteButton }) => {
  const duration = segment.endTime - segment.startTime;

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fire-card rounded-lg overflow-hidden transition-all">
      {/* Thumbnail */}
      <div className="relative">
        <img
          src={segment.thumbnailUrl}
          alt={segment.exerciseName}
          className="w-full h-40 object-cover"
        />
        <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(duration)}
        </div>
        {/* Play Button Overlay */}
        {onPlay && (
          <button
            onClick={() => onPlay(segment)}
            className="absolute inset-0 bg-black/0 hover:bg-black/30 transition-all flex items-center justify-center group"
          >
            <Play className="w-12 h-12 text-white opacity-0 group-hover:opacity-100 transition-opacity fill-white" />
          </button>
        )}
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="font-semibold text-lg mb-1 line-clamp-1">{segment.exerciseName}</h3>
        <p className="text-sm text-gray-600 mb-2 line-clamp-2">
          {segment.sourceVideoId?.title || 'Loading...'}
        </p>

        {/* Muscle Tags */}
        {segment.targetMuscles && segment.targetMuscles.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-3">
            {segment.targetMuscles.map((muscle) => (
              <span
                key={muscle}
                className="text-xs bg-white/20 text-white px-2 py-1 rounded font-bold uppercase tracking-wide border border-white/30"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {muscle}
              </span>
            ))}
          </div>
        )}

        {/* Time Range */}
        <p className="text-xs text-white/60 mb-3">
          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {showAddButton && onAdd && (
            <button
              onClick={() => onAdd(segment._id)}
              className="flex-1 hyper-button px-3 py-2 rounded text-xs flex items-center justify-center gap-1"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          )}

          {showEditButton && onEdit && (
            <button
              onClick={() => onEdit(segment)}
              className="flex-1 bg-white hover:bg-gray-100 text-black px-3 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all hover:scale-105 border-2 border-black"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
          )}

          {showDeleteButton && onDelete && (
            <button
              onClick={() => onDelete(segment._id)}
              className="bg-youtine-red hover:bg-red-700 text-white px-3 py-2 rounded text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-1 transition-all hover:scale-105 border-2 border-white"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default SegmentCard;
