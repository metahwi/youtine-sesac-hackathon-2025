import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { X, Play, Pause, SkipBack, Save, Plus } from 'lucide-react';
import { segmentAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('SegmentEditor');

/**
 * SegmentEditor Component
 * Enhancement 1: Manual segment creation/editing for AI failures
 * Allows users to manually set start/end times using a video player
 */
const SegmentEditor = ({ video, segment, onClose, onSave }) => {
  const { t } = useLanguage();
  const playerRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);

  // Form state
  const [exerciseName, setExerciseName] = useState(segment?.exerciseName || '');
  const [startTime, setStartTime] = useState(segment?.startTime || 0);
  const [endTime, setEndTime] = useState(segment?.endTime || 30);
  const [targetMuscles, setTargetMuscles] = useState(segment?.targetMuscles?.join(', ') || '');
  const [saving, setSaving] = useState(false);

  // Update current time as video plays
  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds);
  };

  const handleDuration = (dur) => {
    setDuration(dur);
  };

  // Set start time from current player time
  const handleSetStartTime = () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      setStartTime(Math.floor(time));
    }
  };

  // Set end time from current player time
  const handleSetEndTime = () => {
    if (playerRef.current) {
      const time = playerRef.current.getCurrentTime();
      setEndTime(Math.floor(time));
    }
  };

  // Seek to specific time
  const handleSeekTo = (time) => {
    if (playerRef.current) {
      playerRef.current.seekTo(time, 'seconds');
      setPlaying(true);
    }
  };

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Save segment
  const handleSave = async () => {
    // Validation
    if (!exerciseName.trim()) {
      alert(t('exerciseNameRequired') || 'Exercise name is required');
      return;
    }

    if (startTime >= endTime) {
      alert(t('invalidTimeRange') || 'Start time must be before end time');
      return;
    }

    if (startTime < 0 || endTime > duration) {
      alert(t('timeOutOfRange') || 'Times must be within video duration');
      return;
    }

    try {
      setSaving(true);

      const segmentData = {
        sourceVideoId: video._id,
        exerciseName: exerciseName.trim(),
        startTime,
        endTime,
        targetMuscles: targetMuscles
          .split(',')
          .map((m) => m.trim())
          .filter((m) => m.length > 0),
      };

      let savedSegment;
      if (segment) {
        // Update existing segment
        savedSegment = await segmentAPI.updateSegment(segment._id, segmentData);
        logger.info('Segment updated:', savedSegment._id);
      } else {
        // Create new segment
        savedSegment = await segmentAPI.createSegment(segmentData);
        logger.success('Segment created:', savedSegment._id);
      }

      if (onSave) {
        onSave(savedSegment);
      }
      onClose();
    } catch (error) {
      logger.error('Error saving segment:', error);
      alert(t('saveFailed') || 'Failed to save segment. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
      <div className="fire-card rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex justify-between items-center p-4 border-b border-white/20 sticky top-0 fire-card z-10">
          <div>
            <h3 className="text-lg font-bold gold-glow" style={{ fontFamily: 'var(--font-display)' }}>
              {segment
                ? t('editSegment') || 'Edit Segment'
                : t('createSegment') || 'Create New Segment'}
            </h3>
            <p className="text-sm text-white/70">{video.title}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full transition-colors text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Video Player */}
          <div className="relative bg-black rounded-lg overflow-hidden" style={{ paddingBottom: '56.25%' }}>
            <ReactPlayer
              ref={playerRef}
              url={video.url}
              playing={playing}
              controls={false}
              width="100%"
              height="100%"
              onProgress={handleProgress}
              onDuration={handleDuration}
              style={{ position: 'absolute', top: 0, left: 0 }}
            />
          </div>

          {/* Player Controls */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPlaying(!playing)}
              className="champion-button p-3 rounded-full transition-colors"
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <div className="flex-1">
              <div className="text-sm font-bold text-white mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                {formatTime(currentTime)} / {formatTime(duration)}
              </div>
              <input
                type="range"
                min={0}
                max={duration}
                value={currentTime}
                onChange={(e) => handleSeekTo(parseFloat(e.target.value))}
                className="w-full"
              />
            </div>
          </div>

          {/* Time Range Selection */}
          <div className="bg-white/5 rounded-lg p-4 space-y-4 border border-white/20">
            <h4 className="font-bold gold-glow" style={{ fontFamily: 'var(--font-display)' }}>{t('timeRange') || 'Time Range'}</h4>

            {/* Start Time */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>{t('startTime') || 'Start Time'}</label>
              <input
                type="number"
                value={startTime}
                onChange={(e) => setStartTime(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 bg-white/10 border-2 border-white/20 text-white rounded-lg focus:ring-2 focus:ring-white"
                min={0}
                max={duration}
              />
              <span className="text-sm text-white/70 w-16">{formatTime(startTime)}</span>
              <button
                onClick={() => handleSeekTo(startTime)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-white border border-white/30"
                title="Go to start"
              >
                <SkipBack className="w-4 h-4" />
              </button>
              <button
                onClick={handleSetStartTime}
                className="px-3 py-2 bg-white hover:bg-gray-100 text-black rounded transition-colors text-sm font-bold uppercase tracking-wider border-2 border-black"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('setStart') || 'Set Start'}
              </button>
            </div>

            {/* End Time */}
            <div className="flex items-center gap-3">
              <label className="w-24 text-sm font-bold text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>{t('endTime') || 'End Time'}</label>
              <input
                type="number"
                value={endTime}
                onChange={(e) => setEndTime(parseInt(e.target.value) || 0)}
                className="flex-1 px-3 py-2 bg-white/10 border-2 border-white/20 text-white rounded-lg focus:ring-2 focus:ring-white"
                min={0}
                max={duration}
              />
              <span className="text-sm text-white/70 w-16">{formatTime(endTime)}</span>
              <button
                onClick={() => handleSeekTo(endTime)}
                className="p-2 bg-white/10 hover:bg-white/20 rounded transition-colors text-white border border-white/30"
                title="Go to end"
              >
                <SkipBack className="w-4 h-4 transform rotate-180" />
              </button>
              <button
                onClick={handleSetEndTime}
                className="px-3 py-2 bg-white hover:bg-gray-100 text-black rounded transition-colors text-sm font-bold uppercase tracking-wider border-2 border-black"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('setEnd') || 'Set End'}
              </button>
            </div>

            {/* Duration Display */}
            <div className="bg-white/10 border border-white/30 rounded p-3 text-sm text-white">
              <strong className="uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>{t('duration') || 'Duration'}:</strong> {formatTime(endTime - startTime)}
            </div>
          </div>

          {/* Exercise Details Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-bold text-white mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                {t('exerciseName') || 'Exercise Name'} <span className="text-youtine-red">*</span>
              </label>
              <input
                type="text"
                value={exerciseName}
                onChange={(e) => setExerciseName(e.target.value)}
                placeholder="e.g., Push-ups, Squats, Bench Press"
                className="w-full px-3 py-2 bg-white/10 border-2 border-white/20 text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-bold text-white mb-1 uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                {t('targetMuscles') || 'Target Muscles'}{' '}
                <span className="text-white/60 text-xs">({t('commaSeparated') || 'comma-separated'})</span>
              </label>
              <input
                type="text"
                value={targetMuscles}
                onChange={(e) => setTargetMuscles(e.target.value)}
                placeholder="e.g., Chest, Triceps, Shoulders"
                className="w-full px-3 py-2 bg-white/10 border-2 border-white/20 text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-white/20">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors border-2 border-black font-bold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-display)' }}
              disabled={saving}
            >
              {t('cancel') || 'Cancel'}
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-6 py-2 champion-button rounded-lg transition-colors flex items-center gap-2 disabled:opacity-50"
            >
              {saving ? (
                <>Loading...</>
              ) : segment ? (
                <>
                  <Save className="w-4 h-4" />
                  {t('update') || 'Update'}
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  {t('create') || 'Create'}
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SegmentEditor;
