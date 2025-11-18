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
    <div className="bg-white rounded-lg overflow-hidden hover:shadow-lg transition-shadow border border-gray-200">
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
                className="text-xs bg-yellow-100 text-yellow-800 px-2 py-1 rounded font-medium"
              >
                {muscle}
              </span>
            ))}
          </div>
        )}

        {/* Time Range */}
        <p className="text-xs text-gray-500 mb-3">
          {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
        </p>

        {/* Actions */}
        <div className="flex gap-2">
          {showAddButton && onAdd && (
            <button
              onClick={() => onAdd(segment._id)}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
            >
              <Plus className="w-4 h-4" /> Add
            </button>
          )}

          {showEditButton && onEdit && (
            <button
              onClick={() => onEdit(segment)}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
            >
              <Edit className="w-4 h-4" /> Edit
            </button>
          )}

          {showDeleteButton && onDelete && (
            <button
              onClick={() => onDelete(segment._id)}
              className="bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded text-sm flex items-center justify-center gap-1 transition-colors"
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
