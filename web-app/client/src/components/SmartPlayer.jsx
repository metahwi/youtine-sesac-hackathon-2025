import { useState, useRef, useEffect } from 'react';
import ReactPlayer from 'react-player';
import { X, SkipForward, Pause, Play, RotateCcw } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('SmartPlayer');

/**
 * SmartPlayer Component
 * Seamlessly plays multiple segments from different videos in sequence
 * Core feature for the "mashup" experience
 */
const SmartPlayer = ({ segments, onClose }) => {
  const { t } = useLanguage();
  const playerRef = useRef(null);
  const intervalRef = useRef(null);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [playing, setPlaying] = useState(true);
  const [ready, setReady] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);

  const currentSegment = segments[currentIndex];
  const isLastSegment = currentIndex === segments.length - 1;

  // Format seconds to MM:SS
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Seek to startTime when video is ready or segment changes
  useEffect(() => {
    if (ready && playerRef.current && currentSegment) {
      logger.info(`Seeking to ${currentSegment.startTime}s for segment ${currentIndex + 1}`);
      playerRef.current.seekTo(currentSegment.startTime, 'seconds');
      setPlaying(true);
    }
  }, [ready, currentIndex, currentSegment]);

  // Monitor playback and stop at endTime
  useEffect(() => {
    if (!playing || !ready) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      if (playerRef.current && currentSegment) {
        const time = playerRef.current.getCurrentTime();
        setCurrentTime(time);

        // Check if we've reached endTime
        if (time >= currentSegment.endTime) {
          logger.info(`Reached end of segment ${currentIndex + 1} at ${time}s`);
          clearInterval(intervalRef.current);

          // Move to next segment or finish
          if (currentIndex < segments.length - 1) {
            setReady(false); // Reset ready state for next video
            setCurrentIndex(currentIndex + 1);
          } else {
            setPlaying(false);
            logger.success('Routine complete!');
            alert(t('routineComplete') || 'Routine complete! Great workout!');
          }
        }
      }
    }, 100); // Check every 100ms

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [playing, ready, currentIndex, currentSegment, segments.length]);

  const handleReady = () => {
    logger.info(`Player ready for segment ${currentIndex + 1}`);
    setReady(true);
  };

  const handleSkip = () => {
    if (currentIndex < segments.length - 1) {
      setReady(false);
      setCurrentIndex(currentIndex + 1);
    }
  };

  const handleRestart = () => {
    setReady(false);
    setCurrentIndex(0);
    setPlaying(true);
  };

  const handleProgress = (state) => {
    setCurrentTime(state.playedSeconds);
  };

  if (!currentSegment) {
    return null;
  }

  const progress = ((currentTime - currentSegment.startTime) / (currentSegment.endTime - currentSegment.startTime)) * 100;
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className="fixed inset-0 bg-black bg-opacity-90 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg max-w-6xl w-full mx-4 overflow-hidden">
        {/* Header */}
        <div className="flex justify-between items-center p-4 bg-gray-900 text-white">
          <div>
            <h3 className="font-semibold text-lg">{currentSegment.exerciseName}</h3>
            <p className="text-sm text-gray-300">
              {t('segment') || 'Segment'} {currentIndex + 1} {t('of') || 'of'} {segments.length} •{' '}
              {currentSegment.sourceVideoId?.title}
            </p>
          </div>
          <button
            onClick={onClose}
            className="hover:bg-gray-800 p-2 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative bg-black" style={{ paddingBottom: '56.25%' }}>
          <ReactPlayer
            ref={playerRef}
            url={currentSegment.sourceVideoId?.url}
            playing={playing}
            controls={false}
            width="100%"
            height="100%"
            onReady={handleReady}
            onProgress={handleProgress}
            style={{ position: 'absolute', top: 0, left: 0 }}
          />

          {/* Loading Overlay */}
          {!ready && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50">
              <div className="text-white text-lg">
                {t('loading') || 'Loading'}...
              </div>
            </div>
          )}
        </div>

        {/* Segment Progress Bar */}
        <div className="bg-gray-200 h-2">
          <div
            className="bg-yellow-500 h-full transition-all duration-100"
            style={{ width: `${clampedProgress}%` }}
          />
        </div>

        {/* Controls */}
        <div className="flex justify-between items-center p-4 bg-gray-100">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setPlaying(!playing)}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-full transition-colors"
            >
              {playing ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>

            <button
              onClick={handleRestart}
              className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 transition-colors"
            >
              <RotateCcw className="w-4 h-4" />
              {t('restart') || 'Restart'}
            </button>
          </div>

          <div className="text-center flex-1">
            <div className="text-sm text-gray-600">
              {formatTime(currentTime - currentSegment.startTime)} /{' '}
              {formatTime(currentSegment.endTime - currentSegment.startTime)}
            </div>
            {currentSegment.targetMuscles && currentSegment.targetMuscles.length > 0 && (
              <div className="flex justify-center gap-1 mt-1">
                {currentSegment.targetMuscles.map((muscle) => (
                  <span
                    key={muscle}
                    className="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded"
                  >
                    {muscle}
                  </span>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={handleSkip}
            disabled={isLastSegment}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {t('next') || 'Next'}
            <SkipForward className="w-4 h-4" />
          </button>
        </div>

        {/* Overall Routine Progress */}
        <div className="px-4 pb-4 bg-gray-100">
          <div className="flex gap-1">
            {segments.map((_, idx) => (
              <div
                key={idx}
                className={`h-2 flex-1 rounded-full transition-colors ${
                  idx === currentIndex
                    ? 'bg-yellow-500'
                    : idx < currentIndex
                    ? 'bg-green-500'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <div className="text-xs text-gray-600 mt-2 text-center">
            {t('routineProgress') || 'Routine Progress'}: {currentIndex + 1} / {segments.length}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SmartPlayer;
