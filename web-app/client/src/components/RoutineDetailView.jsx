import { Play, Trash2, Edit, ChevronUp, ChevronDown } from 'lucide-react';
import { formatDuration } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * RoutineDetailView Component
 * Displays and manages the routine queue (segments and/or full videos)
 * using normalized queue items from the backend.
 * Reordering is done via up/down buttons (no drag & drop).
 */
const RoutineDetailView = ({
  routine,
  queueItems = [],
  onUpdateRoutine,
  onRemoveSegment,
  onRemoveVideo,
  onPlayRoutine,
  onEditSegment,
}) => {
  const { t } = useLanguage();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };
  
  if (!routine) {
    return (
      <div className="fire-card rounded-lg p-8 text-center">
        <p className="text-white/70">{t('selectRoutine')}</p>
      </div>
    );
  }

  const segmentItems = Array.isArray(queueItems)
    ? queueItems.filter((item) => item.type === 'segment')
    : [];

  const handleMove = (index, delta) => {
    const target = index + delta;
    if (target < 0 || target >= segmentItems.length) return;

    const items = [...segmentItems];
    const [moved] = items.splice(index, 1);
    items.splice(target, 0, moved);

    const segmentIds = items.map((item) => item._id);
    onUpdateRoutine({ segments: segmentIds });
  };

  const segmentCount = segmentItems.length;
  const videoCount = routine.videos?.length || 0;

  const totalDuration =
    segmentItems.reduce((sum, item) => {
      const dur =
        typeof item.duration === 'number'
          ? item.duration
          : (item.endTime || 0) - (item.startTime || 0);
      return sum + (dur || 0);
    }, 0) || 0;

  const hasQueueItems = segmentCount > 0 || videoCount > 0;

  return (
    <div className="fire-card rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2
              className="text-2xl font-bold mb-2 gold-glow"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {routine.name}
            </h2>
            {routine.description && (
              <p className="text-white/80 mb-2">{routine.description}</p>
            )}
            <div className="flex gap-4 text-sm text-white/60">
              <span>
                {segmentCount} {t('segments') || 'segments'}
              </span>
              <span>
                {videoCount}{' '}
                {videoCount === 1 ? t('video') || 'video' : t('videos') || 'videos'}
              </span>
              <span>
                {t('totalDuration')}: {formatDuration(totalDuration, t)}
              </span>
            </div>
          </div>
          {segmentCount > 0 && onPlayRoutine && (
            <button
              onClick={() => onPlayRoutine(routine.segments || [])}
              className="champion-button px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              {t('startRoutine') || 'Start Routine'}
            </button>
          )}
        </div>
      </div>

      {segmentCount > 0 ? (
        <div className="space-y-2">
          {segmentItems.map((item, index) => {
            const duration =
              typeof item.duration === 'number'
                ? item.duration
                : (item.endTime || 0) - (item.startTime || 0);

            return (
              <div
                key={item._id}
                className="bg-white/5 border-2 rounded-lg p-3 flex items-center gap-3 hover:bg-white/10 transition-all"
              >
                {/* Order + Move controls */}
                <div className="flex flex-col items-center gap-1 mr-2">
                  <div className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white/30">
                    {index + 1}
                  </div>
                  <div className="flex flex-col gap-1">
                    <button
                      type="button"
                      onClick={() => handleMove(index, -1)}
                      disabled={index === 0}
                      className="p-0.5 rounded disabled:opacity-40 text-white/70 hover:text-white"
                    >
                      <ChevronUp className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleMove(index, 1)}
                      disabled={index === segmentCount - 1}
                      className="p-0.5 rounded disabled:opacity-40 text-white/70 hover:text-white"
                    >
                      <ChevronDown className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Thumbnail */}
                <div className="relative flex-shrink-0">
                  <img
                    src={item.thumbnail}
                    alt={item.exerciseName}
                    className="w-24 h-16 object-cover rounded"
                  />
                  <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 py-0.5 rounded">
                    {formatTime(duration)}
                  </div>
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3
                    className="font-bold text-base mb-1 text-white uppercase tracking-wider"
                    style={{ fontFamily: 'var(--font-display)' }}
                  >
                    {item.exerciseName}
                  </h3>
                  <p className="text-sm text-white/70 line-clamp-1 mb-1">
                    {item.title}
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-white/60">
                      {formatTime(item.startTime || 0)} - {formatTime(item.endTime || 0)}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2">
                  {onEditSegment && (
                    <button
                      onClick={() => onEditSegment(item)}
                      className="px-3 py-2 bg-white hover:bg-gray-100 text-black rounded text-sm flex items-center gap-1 transition-colors border-2 border-black font-bold"
                      title="Edit segment"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                  )}

                  <button
                    onClick={() => {
                      if (onRemoveSegment) {
                        onRemoveSegment(item._id);
                      } else if (onRemoveVideo && item.videoId) {
                        onRemoveVideo(item.videoId);
                      }
                    }}
                    className="px-3 py-2 bg-youtine-red hover:bg-red-700 text-white rounded text-sm flex items-center gap-1 transition-colors border-2 border-white font-bold"
                    title="Remove from routine"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      ) : hasQueueItems ? (
        <div className="text-center py-12 bg-white/5 rounded-lg border-2 border-dashed border-white/20">
          <p className="text-white/70 mb-2">
            {t('emptyRoutineSegments') || 'This routine has videos but no segments yet.'}
          </p>
          <p className="text-sm text-white/50">
            {t('addSegmentsFromLibrary') || 'Add segments from the Exercise Library.'}
          </p>
        </div>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-lg border-2 border-dashed border-white/20">
          <p className="text-white/70 mb-2">
            {t('emptyRoutine') || 'This routine is empty.'}
          </p>
          <p className="text-sm text-white/50">
            {t('addSegmentsFromLibrary') ||
              'Add videos or segments from your library below.'}
          </p>
        </div>
      )}
    </div>
  );
};

export default RoutineDetailView;
