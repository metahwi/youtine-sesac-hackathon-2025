import { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { GripVertical, Play, Clipboard, Trash2, Edit } from 'lucide-react';
import VideoCard from './VideoCard';
import { formatDuration } from '../lib/utils';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * RoutineDetailView Component
 * Displays and manages segments within a selected routine
 * UPDATED: Now displays segments instead of full videos
 * Supports drag-and-drop reordering and segment playback
 */
const RoutineDetailView = ({ routine, onUpdateRoutine, onRemoveSegment, onPlayRoutine, onEditSegment }) => {
  const { t } = useLanguage();

  // Format seconds to MM:SS
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

  const handleDragEnd = (result) => {
    if (!result.destination) return;

    const items = Array.from(routine.segments || []);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    // Update routine with new segment order
    const segmentIds = items.map(segment => segment._id);
    onUpdateRoutine({ segments: segmentIds });
  };

  const totalDuration = routine.segments?.reduce((sum, segment) => sum + (segment.endTime - segment.startTime), 0) || 0;

  return (
    <div className="fire-card rounded-lg p-6">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold mb-2 gold-glow" style={{ fontFamily: 'var(--font-display)' }}>{routine.name}</h2>
            {routine.description && (
              <p className="text-white/80 mb-2">{routine.description}</p>
            )}
            <div className="flex gap-4 text-sm text-white/60">
              <span>{routine.segments?.length || 0} {t('segments') || 'segments'}</span>
              <span>•</span>
              <span>{t('totalDuration')}: {formatDuration(totalDuration, t)}</span>
            </div>
          </div>
          {routine.segments && routine.segments.length > 0 && onPlayRoutine && (
            <button
              onClick={() => onPlayRoutine(routine.segments)}
              className="champion-button px-6 py-3 rounded-lg flex items-center gap-2"
            >
              <Play className="w-5 h-5" />
              {t('startRoutine') || 'Start Routine'}
            </button>
          )}
        </div>
      </div>

      {routine.segments && routine.segments.length > 0 ? (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="routine-segments">
            {(provided, snapshot) => (
              <div
                {...provided.droppableProps}
                ref={provided.innerRef}
                className={`space-y-2 ${snapshot.isDraggingOver ? 'bg-white/10 p-2 rounded-lg' : ''}`}
              >
                {routine.segments.map((segment, index) => (
                  <Draggable key={segment._id} draggableId={segment._id} index={index}>
                    {(provided, snapshot) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`bg-white/5 border-2 rounded-lg p-3 flex items-center gap-3 hover:bg-white/10 transition-all ${
                          snapshot.isDragging ? 'shadow-lg border-white' : 'border-white/20'
                        }`}
                      >
                        {/* Drag Handle */}
                        <div {...provided.dragHandleProps} className="cursor-grab active:cursor-grabbing">
                          <GripVertical className="w-5 h-5 text-white/50" />
                        </div>

                        {/* Order Number */}
                        <div className="flex-shrink-0 w-8 h-8 bg-black text-white rounded-full flex items-center justify-center text-sm font-bold border-2 border-white/30">
                          {index + 1}
                        </div>

                        {/* Thumbnail */}
                        <div className="relative flex-shrink-0">
                          <img
                            src={segment.thumbnailUrl}
                            alt={segment.exerciseName}
                            className="w-24 h-16 object-cover rounded"
                          />
                          <div className="absolute bottom-1 right-1 bg-black/75 text-white text-xs px-1 py-0.5 rounded">
                            {formatTime(segment.endTime - segment.startTime)}
                          </div>
                        </div>

                        {/* Segment Info */}
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-base mb-1 text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>{segment.exerciseName}</h3>
                          <p className="text-sm text-white/70 line-clamp-1 mb-1">
                            {segment.sourceVideoId?.title}
                          </p>
                          <div className="flex items-center gap-2">
                            <span className="text-xs text-white/60">
                              {formatTime(segment.startTime)} - {formatTime(segment.endTime)}
                            </span>
                            {segment.targetMuscles && segment.targetMuscles.length > 0 && (
                              <>
                                <span className="text-white/30">•</span>
                                <div className="flex gap-1">
                                  {segment.targetMuscles.slice(0, 3).map((muscle) => (
                                    <span
                                      key={muscle}
                                      className="text-xs bg-white/20 text-white px-2 py-0.5 rounded border border-white/30 font-bold uppercase tracking-wide"
                                      style={{ fontFamily: 'var(--font-display)' }}
                                    >
                                      {muscle}
                                    </span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex gap-2">
                          {onEditSegment && (
                            <button
                              onClick={() => onEditSegment(segment)}
                              className="px-3 py-2 bg-white hover:bg-gray-100 text-black rounded text-sm flex items-center gap-1 transition-colors border-2 border-black font-bold"
                              title="Edit segment"
                            >
                              <Edit className="w-4 h-4" />
                            </button>
                          )}

                          <button
                            onClick={() => onRemoveSegment(segment._id)}
                            className="px-3 py-2 bg-youtine-red hover:bg-red-700 text-white rounded text-sm flex items-center gap-1 transition-colors border-2 border-white font-bold"
                            title="Remove from routine"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      ) : (
        <div className="text-center py-12 bg-white/5 rounded-lg border-2 border-dashed border-white/20">
          <p className="text-white/70 mb-2">{t('emptyRoutine') || 'No segments in this routine yet'}</p>
          <p className="text-sm text-white/50">{t('addSegmentsFromLibrary') || 'Add segments from the Exercise Library'}</p>
        </div>
      )}
    </div>
  );
};

export default RoutineDetailView;

