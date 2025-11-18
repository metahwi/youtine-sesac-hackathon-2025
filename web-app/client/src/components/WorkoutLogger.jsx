import React, { useState, useEffect } from 'react';
import { videoAPI, logAPI } from '../services/api';
import { useLanguage } from '../contexts/LanguageContext';
import { Play, Plus, History, Loader } from 'lucide-react';
import WorkoutLogForm from './WorkoutLogForm';

/**
 * WorkoutLogger Component
 * Displays AI-detected exercise segments for a video
 * Allows users to log their performance for each exercise
 */
const WorkoutLogger = ({ videoId, onClose }) => {
  const { t } = useLanguage();
  const [video, setVideo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedSegment, setSelectedSegment] = useState(null);
  const [showLogForm, setShowLogForm] = useState(false);
  const [exerciseHistory, setExerciseHistory] = useState({});

  useEffect(() => {
    loadVideoData();
  }, [videoId]);

  const loadVideoData = async () => {
    try {
      setLoading(true);
      const videoData = await videoAPI.getVideo(videoId);
      setVideo(videoData);
      
      // Load history for each exercise
      if (videoData.segments && videoData.segments.length > 0) {
        const historyPromises = videoData.segments.map(segment =>
          logAPI.getExerciseHistory(segment.exerciseName, 1)
        );
        const histories = await Promise.all(historyPromises);
        
        const historyMap = {};
        videoData.segments.forEach((segment, index) => {
          if (histories[index] && histories[index].length > 0) {
            historyMap[segment.exerciseName] = histories[index][0];
          }
        });
        setExerciseHistory(historyMap);
      }
    } catch (error) {
      console.error('Error loading video data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddLog = (segment) => {
    setSelectedSegment(segment);
    setShowLogForm(true);
  };

  const handleLogSubmit = async (logData) => {
    try {
      await logAPI.createLog({
        ...logData,
        videoId: video._id,
        segmentTimestamp: selectedSegment.timestamp
      });
      
      // Reload history
      await loadVideoData();
      setShowLogForm(false);
      setSelectedSegment(null);
    } catch (error) {
      console.error('Error creating log:', error);
      alert('Failed to save workout log');
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (loading) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="fire-card rounded-lg p-8">
          <Loader className="w-8 h-8 animate-spin text-white" />
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="fire-card rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 fire-card border-b border-white/20 p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold gold-glow" style={{ fontFamily: 'var(--font-display)' }}>{video.title}</h2>
            <p className="text-white/70 mt-1">
              {video.status === 'pending' && '⏳ Analyzing video...'}
              {video.status === 'completed' && `✅ ${video.segments.length} exercises detected`}
              {video.status === 'failed' && '❌ Analysis failed'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-white/70 hover:text-white text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {video.status === 'pending' && (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 animate-spin text-white mx-auto mb-4" />
              <p className="text-white">Analyzing video with AI...</p>
              <p className="text-sm text-white/70 mt-2">This may take a minute</p>
            </div>
          )}

          {video.status === 'failed' && (
            <div className="text-center py-12">
              <p className="text-youtine-red mb-2 font-bold">❌ AI Analysis Failed</p>
              <p className="text-sm text-white/70">{video.analysisError}</p>
            </div>
          )}

          {video.status === 'completed' && video.segments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-white">No exercises detected in this video</p>
              <p className="text-sm text-white/70 mt-2">
                The AI couldn't identify specific exercises. You can still log manually.
              </p>
            </div>
          )}

          {video.status === 'completed' && video.segments.length > 0 && (
            <div className="space-y-4">
              {video.segments.map((segment, index) => {
                const lastLog = exerciseHistory[segment.exerciseName];
                
                return (
                  <div
                    key={index}
                    className="border-2 border-white/20 rounded-lg p-4 hover:border-white/40 transition-all bg-white/5 hover:bg-white/10"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Play className="w-4 h-4 text-white" />
                          <span className="text-sm text-white/60">
                            {formatTime(segment.timestamp)}
                          </span>
                        </div>

                        <h3 className="text-lg font-bold mb-2 text-white uppercase tracking-wider" style={{ fontFamily: 'var(--font-display)' }}>
                          {segment.exerciseName}
                        </h3>

                        <div className="flex flex-wrap gap-2 mb-3">
                          {segment.targetMuscles.map((muscle, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-white/20 text-white rounded text-sm border border-white/30 font-bold uppercase tracking-wide"
                              style={{ fontFamily: 'var(--font-display)' }}
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>

                        {lastLog && (
                          <div className="text-sm text-white/70 bg-white/10 p-2 rounded border border-white/20">
                            <History className="w-4 h-4 inline mr-1" />
                            Last time: {lastLog.sets.length} sets
                            {lastLog.sets.length > 0 && lastLog.sets[0].reps && (
                              <span> × {lastLog.sets[0].reps} reps</span>
                            )}
                            {lastLog.sets.length > 0 && lastLog.sets[0].weight && (
                              <span> @ {lastLog.sets[0].weight}kg</span>
                            )}
                          </div>
                        )}
                      </div>

                      <button
                        onClick={() => handleAddLog(segment)}
                        className="ml-4 px-4 py-2 champion-button rounded flex items-center gap-2"
                      >
                        <Plus className="w-4 h-4" />
                        Log
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Log Form Modal */}
      {showLogForm && selectedSegment && (
        <WorkoutLogForm
          exerciseName={selectedSegment.exerciseName}
          onSubmit={handleLogSubmit}
          onCancel={() => {
            setShowLogForm(false);
            setSelectedSegment(null);
          }}
        />
      )}
    </div>
  );
};

export default WorkoutLogger;

