import { formatDuration } from '../lib/utils';
import { Plus, Trash2, Play, Clipboard, Loader, Edit3, AlertCircle } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * VideoCard Component
 * Displays a video with thumbnail, title, and duration
 * Provides actions to add to routine, remove from routine, play, log workout, or delete
 */
const VideoCard = ({
  video,
  onAdd,
  onRemove,
  onPlay,
  onDelete,
  onLogWorkout,
  onCreateSegment,
  showAddButton = true,
  showRemoveButton = false,
  showDeleteButton = false,
  showLogButton = false,
  showCreateSegmentButton = false,
  showAnalysisStatus = false
}) => {
  const { t } = useLanguage();
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 group">
      <div className="relative cursor-pointer" onClick={() => onPlay && onPlay(video)}>
        <img
          src={video.thumbnail}
          alt={video.title}
          className="w-full h-40 object-cover block"
        />
        
        {/* AI Analysis Status Indicator */}
        {showAnalysisStatus && video.status === 'pending' && (
          <div className="absolute top-2 left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <Loader className="w-3 h-3 animate-spin" />
            Analyzing...
          </div>
        )}

        {showAnalysisStatus && video.status === 'completed' && video.segments && video.segments.length > 0 && (
          <div className="absolute top-2 left-2 bg-green-500 text-white text-xs px-2 py-1 rounded">
            ✓ {video.segments.length} exercises
          </div>
        )}

        {showAnalysisStatus && video.status === 'failed' && (
          <div className="absolute top-2 left-2 bg-red-500 text-white text-xs px-2 py-1 rounded flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            AI Failed
          </div>
        )}
        
        {/* Play button overlay */}
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200 flex items-center justify-center pointer-events-none">
          <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <Play className="w-12 h-12 text-white fill-white" />
          </div>
        </div>
        
        <div className="absolute bottom-2 right-2 bg-black/75 text-white text-xs px-2 py-1 rounded">
          {formatDuration(video.duration)}
        </div>
      </div>
      
      <div className="p-4">
        <h3 className="font-semibold text-sm line-clamp-2 mb-3 min-h-[2.5rem]">
          {video.title}
        </h3>
        
        <div className="flex gap-2 flex-wrap">
          {showCreateSegmentButton && onCreateSegment && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                onCreateSegment(video);
              }}
              className="flex-1 flex items-center justify-center gap-2 bg-yellow-500 hover:bg-yellow-600 text-black px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              title="Create segment manually"
            >
              <Edit3 size={16} />
              {t('createSegment') || 'Create Segment'}
            </button>
          )}

          {showAddButton && onAdd && (
            <button
              onClick={() => onAdd(video)}
              className="flex-1 flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              <Plus size={16} />
              {t('add')}
            </button>
          )}

          {showLogButton && onLogWorkout && (
            <button
              onClick={() => onLogWorkout(video)}
              className="flex-1 flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
              title="Log workout"
            >
              <Clipboard size={16} />
              {t('log') || 'Log'}
            </button>
          )}
          
          {showRemoveButton && onRemove && (
            <button
              onClick={() => onRemove(video)}
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              <Trash2 size={16} />
              {t('remove')}
            </button>
          )}
          
          {showDeleteButton && onDelete && (
            <button
              onClick={() => onDelete(video)}
              className="flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white px-3 py-2 rounded-md text-sm font-medium transition-colors duration-200"
            >
              <Trash2 size={16} />
              {t('delete')}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoCard;

