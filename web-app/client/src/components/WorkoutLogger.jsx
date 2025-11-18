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
        <div className="bg-white rounded-lg p-8">
          <Loader className="w-8 h-8 animate-spin text-blue-600" />
        </div>
      </div>
    );
  }

  if (!video) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold">{video.title}</h2>
            <p className="text-gray-600 mt-1">
              {video.status === 'pending' && '⏳ Analyzing video...'}
              {video.status === 'completed' && `✅ ${video.segments.length} exercises detected`}
              {video.status === 'failed' && '❌ Analysis failed'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 text-2xl"
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {video.status === 'pending' && (
            <div className="text-center py-12">
              <Loader className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
              <p className="text-gray-600">Analyzing video with AI...</p>
              <p className="text-sm text-gray-500 mt-2">This may take a minute</p>
            </div>
          )}

          {video.status === 'failed' && (
            <div className="text-center py-12">
              <p className="text-red-600 mb-2">❌ AI Analysis Failed</p>
              <p className="text-sm text-gray-500">{video.analysisError}</p>
            </div>
          )}

          {video.status === 'completed' && video.segments.length === 0 && (
            <div className="text-center py-12">
              <p className="text-gray-600">No exercises detected in this video</p>
              <p className="text-sm text-gray-500 mt-2">
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
                    className="border rounded-lg p-4 hover:shadow-md transition-shadow"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Play className="w-4 h-4 text-blue-600" />
                          <span className="text-sm text-gray-500">
                            {formatTime(segment.timestamp)}
                          </span>
                        </div>
                        
                        <h3 className="text-lg font-semibold mb-2">
                          {segment.exerciseName}
                        </h3>
                        
                        <div className="flex flex-wrap gap-2 mb-3">
                          {segment.targetMuscles.map((muscle, i) => (
                            <span
                              key={i}
                              className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-sm"
                            >
                              {muscle}
                            </span>
                          ))}
                        </div>

                        {lastLog && (
                          <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
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
                        className="ml-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-2"
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

