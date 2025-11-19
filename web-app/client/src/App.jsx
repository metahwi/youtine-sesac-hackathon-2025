import { useState, useEffect } from 'react';
import { Play, LayoutDashboard, Video, Clipboard } from 'lucide-react';
import './App.css';

// Components
import VideoInputForm from './components/VideoInputForm';
import VideoLibrary from './components/VideoLibrary';
import SegmentLibrary from './components/SegmentLibrary';
import SegmentEditor from './components/SegmentEditor';
import SmartPlayer from './components/SmartPlayer';
import RoutineList from './components/RoutineList';
import RoutineDetailView from './components/RoutineDetailView';
import LanguageSwitcher from './components/LanguageSwitcher';
import VideoPlayer from './components/VideoPlayer';
import DashboardPage from './components/DashboardPage';
import WorkoutLogger from './components/WorkoutLogger';

// API Services
import { videoAPI, routineAPI, segmentAPI } from './services/api';

// Language Context
import { useLanguage } from './contexts/LanguageContext';

// Logger
import { createLogger } from './utils/logger';

const logger = createLogger('App');

function App() {
  const { t } = useLanguage();
  const [videos, setVideos] = useState([]);
  const [routines, setRoutines] = useState([]);
  const [activeRoutineId, setActiveRoutineId] = useState(null);
  const [activeRoutine, setActiveRoutine] = useState(null);
  const [loading, setLoading] = useState(true);
  const [playingVideo, setPlayingVideo] = useState(null);
  const [currentView, setCurrentView] = useState('segments'); // 'dashboard', 'library', 'segments'
  const [loggingVideo, setLoggingVideo] = useState(null);

  // New segment-related state
  const [editingSegment, setEditingSegment] = useState(null);
  const [editingVideo, setEditingVideo] = useState(null);
  const [playingSegments, setPlayingSegments] = useState(null);
  const [queueItems, setQueueItems] = useState([]);

  // Fetch initial data
  useEffect(() => {
    fetchVideos();
    fetchRoutines();
  }, []);

  // Fetch active routine details when selection changes
  useEffect(() => {
    if (activeRoutineId) {
      fetchRoutineDetails(activeRoutineId);
      fetchRoutineQueue(activeRoutineId);
    } else {
      setActiveRoutine(null);
      setQueueItems([]);
    }
  }, [activeRoutineId]);

  const fetchVideos = async () => {
    try {
      const data = await videoAPI.getAllVideos();
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setVideos(data);
      } else {
        logger.warn('API returned non-array data for videos:', data);
        setVideos([]);
      }
    } catch (error) {
      logger.error('Error fetching videos:', error);
      setVideos([]); // Reset to empty array on error
    }
  };

  const fetchRoutines = async () => {
    try {
      setLoading(true);
      const data = await routineAPI.getAllRoutines();
      // Ensure data is always an array
      if (Array.isArray(data)) {
        setRoutines(data);
      } else {
        logger.warn('API returned non-array data for routines:', data);
        setRoutines([]);
      }
    } catch (error) {
      logger.error('Error fetching routines:', error);
      setRoutines([]); // Reset to empty array on error
    } finally {
      setLoading(false);
    }
  };

  const fetchRoutineDetails = async (id) => {
    try {
      const data = await routineAPI.getRoutine(id);
      if (data && typeof data === 'object') {
        setActiveRoutine(data);
      } else {
        logger.warn('API returned invalid data for routine:', data);
        setActiveRoutine(null);
      }
    } catch (error) {
      logger.error('Error fetching routine details:', error);
      setActiveRoutine(null); // Reset to null on error
    }
  };

  const fetchRoutineQueue = async (id) => {
    try {
      const data = await routineAPI.getRoutineQueue(id);
      if (Array.isArray(data)) {
        setQueueItems(data);
      } else {
        logger.warn('API returned invalid data for routine queue:', data);
        setQueueItems([]);
      }
    } catch (error) {
      logger.error('Error fetching routine queue:', error);
      setQueueItems([]);
    }
  };

  const handleVideoAdded = async (url) => {
    await videoAPI.addVideo(url);
    await fetchVideos();
  };

  const handleCreateRoutine = async (name, description) => {
    try {
      const newRoutine = await routineAPI.createRoutine(name, description);
      setRoutines([...routines, newRoutine]);
      setActiveRoutineId(newRoutine._id);
    } catch (error) {
      logger.error('Error creating routine:', error);
    }
  };

  const handleDeleteRoutine = async (id) => {
    if (window.confirm(t('confirmDeleteRoutine') || 'Are you sure you want to delete this routine?')) {
      try {
        await routineAPI.deleteRoutine(id);
        setRoutines(routines.filter(r => r._id !== id));
        if (activeRoutineId === id) {
          setActiveRoutineId(null);
        }
      } catch (error) {
        logger.error('Error deleting routine:', error);
      }
    }
  };

  const handleAddToRoutine = async (video) => {
    const videoId = typeof video === 'string' ? video : video?._id;

    if (!videoId) {
      logger.warn('handleAddToRoutine called without a valid videoId', video);
      return;
    }

    if (!activeRoutine) {
      alert(t('selectRoutineFirst') || 'Please select a routine first');
      return;
    }

    try {
      // Delegate queue item management to the backend
      const updatedRoutine = await routineAPI.addVideoToRoutine(activeRoutine._id, videoId);
      setActiveRoutine(updatedRoutine);
      await fetchRoutineQueue(activeRoutine._id);
      await fetchRoutines();
    } catch (error) {
      logger.error('Error adding video to routine:', error);
    }
  };

  const handleRemoveFromRoutine = async (video) => {
    const videoId = typeof video === 'string' ? video : video?._id;

    if (!videoId) {
      logger.warn('handleRemoveFromRoutine called without a valid videoId', video);
      return;
    }

    if (!activeRoutine) return;

    try {
      const remainingVideoIds = (activeRoutine.videos || [])
        .filter(v => v._id !== videoId)
        .map(v => v._id);

      // Remove any segments that belong to this video from the routine queue
      let remainingSegmentIds = activeRoutine.segments?.map(s => s._id) || [];
      try {
        const videoSegments = await videoAPI.getVideoSegments(videoId);
        const segmentIdsToRemove = new Set((videoSegments || []).map(s => s._id));

        if (segmentIdsToRemove.size > 0) {
          remainingSegmentIds = remainingSegmentIds.filter(
            (id) => !segmentIdsToRemove.has(id)
          );
        }
      } catch (innerError) {
        logger.warn('Failed to fetch segments for video while removing from routine:', innerError);
      }

      const updatedRoutine = await routineAPI.updateRoutine(activeRoutine._id, {
        videos: remainingVideoIds,
        segments: remainingSegmentIds
      });
      setActiveRoutine(updatedRoutine);
      await fetchRoutineQueue(activeRoutine._id);
      await fetchRoutines();
    } catch (error) {
      logger.error('Error removing video from routine:', error);
    }
  };

  const handleUpdateRoutine = async (updatedData) => {
    if (!activeRoutine) return;

    try {
      const updated = await routineAPI.updateRoutine(activeRoutine._id, updatedData);
      setActiveRoutine(updated);
      await fetchRoutines();
    } catch (error) {
      logger.error('Error updating routine:', error);
    }
  };

  const handleDeleteVideo = async (videoId) => {
    if (window.confirm(t('confirmDeleteVideo') || 'Are you sure you want to delete this video?')) {
      try {
        await videoAPI.deleteVideo(videoId);
        setVideos(videos.filter(v => v._id !== videoId));
        await fetchRoutines();
      } catch (error) {
        logger.error('Error deleting video:', error);
        alert(t('deleteVideoError') || 'Failed to delete video. Please try again.');
      }
    }
  };

  const handlePlayVideo = (video) => {
    setPlayingVideo(video);
  };

  const handleLogWorkout = (video) => {
    setLoggingVideo(video);
  };

  // New segment handlers
  const handleAddSegmentToRoutine = async (segmentId) => {
    if (!activeRoutine) {
      alert(t('selectRoutineFirst') || 'Please select a routine first');
      return;
    }

    try {
      const currentSegmentIds = activeRoutine.segments?.map(s => s._id) || [];
      const updatedRoutine = await routineAPI.updateRoutine(activeRoutine._id, {
        segments: [...currentSegmentIds, segmentId]
      });
      setActiveRoutine(updatedRoutine);
      await fetchRoutines();
    } catch (error) {
      logger.error('Error adding segment to routine:', error);
    }
  };

  const handleRemoveSegmentFromRoutine = async (segmentId) => {
    if (!activeRoutine) return;

    try {
      const updatedSegmentIds = activeRoutine.segments
        ?.filter(s => s._id !== segmentId)
        .map(s => s._id) || [];

      const updatedRoutine = await routineAPI.updateRoutine(activeRoutine._id, {
        segments: updatedSegmentIds
      });
      setActiveRoutine(updatedRoutine);
      await fetchRoutines();
    } catch (error) {
      logger.error('Error removing segment from routine:', error);
    }
  };

  const handleEditSegment = (segment, video = null) => {
    setEditingSegment(segment);
    setEditingVideo(video || segment.sourceVideoId);
  };

  const handleDeleteSegment = async (segmentId) => {
    if (window.confirm(t('confirmDeleteSegment') || 'Delete this segment?')) {
      try {
        await segmentAPI.deleteSegment(segmentId);
        await fetchRoutines(); // Refresh routines in case they contained this segment
      } catch (error) {
        logger.error('Error deleting segment:', error);
      }
    }
  };

  const handlePlaySegment = (segment) => {
    setPlayingSegments([segment]);
  };

  const handlePlayRoutine = (segments) => {
    setPlayingSegments(segments);
  };

  const handleSegmentSaved = async () => {
    await fetchRoutines();
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header - ARENA FIRE */}
      <header className="sticky top-0 z-50 backdrop-blur-md" style={{background: 'rgba(10, 10, 10, 0.85)', borderBottom: '3px solid rgba(255, 215, 0, 0.5)'}}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-1">
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentView('library')}
              className="flex items-center hover:scale-105 transition-all duration-300 cursor-pointer group"
              aria-label="Go to home"
            >
              <img
                src="/youtine_logo_v3.png"
                alt="YouTine Fitness & Media"
                className="h-40 -my-10 transition-transform duration-300 group-hover:scale-110 white-glow"
                style={{ objectFit: 'cover', objectPosition: 'center' }}
              />
            </button>

            {/* Navigation - CHAMPIONSHIP BUTTONS */}
            <div className="flex items-center gap-4">
              <nav className="flex gap-3">
                <button
                  onClick={() => setCurrentView('segments')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 ${
                    currentView === 'segments'
                      ? 'champion-button pulse-active'
                      : 'ghost-button'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <Play className="w-5 h-5" />
                  {t('segments') || 'Segments'}
                </button>

                <button
                  onClick={() => setCurrentView('library')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 ${
                    currentView === 'library'
                      ? 'champion-button pulse-active'
                      : 'ghost-button'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <Video className="w-5 h-5" />
                  {t('videos') || 'Videos'}
                </button>

                <button
                  onClick={() => setCurrentView('dashboard')}
                  className={`flex items-center gap-2 px-5 py-2.5 rounded-lg transition-all duration-300 ${
                    currentView === 'dashboard'
                      ? 'champion-button pulse-active'
                      : 'ghost-button'
                  }`}
                  style={{ fontFamily: 'var(--font-display)' }}
                >
                  <LayoutDashboard className="w-5 h-5" />
                  {t('dashboard') || 'Dashboard'}
                </button>
              </nav>

              <LanguageSwitcher />
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      {currentView === 'dashboard' && <DashboardPage routines={routines} />}

      {currentView === 'segments' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Routines */}
            <div className="lg:col-span-1">
              <RoutineList
                routines={routines}
                activeRoutineId={activeRoutineId}
                onSelectRoutine={setActiveRoutineId}
                onCreateRoutine={handleCreateRoutine}
                onDeleteRoutine={handleDeleteRoutine}
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Routine Detail View */}
              <RoutineDetailView
                routine={activeRoutine}
                queueItems={queueItems}
                onUpdateRoutine={handleUpdateRoutine}
                onRemoveSegment={handleRemoveSegmentFromRoutine}
                onPlayRoutine={handlePlayRoutine}
                onEditSegment={handleEditSegment}
              />

              {/* Video Input Form */}
              <VideoInputForm onVideoAdded={handleVideoAdded} />

              {/* Segment Library */}
              <SegmentLibrary
                onAddToRoutine={handleAddSegmentToRoutine}
                onEditSegment={handleEditSegment}
                onDeleteSegment={handleDeleteSegment}
                onPlaySegment={handlePlaySegment}
                activeRoutine={activeRoutine}
              />
            </div>
          </div>
        </div>
      )}

      {currentView === 'library' && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Sidebar - Routines */}
            <div className="lg:col-span-1">
              <RoutineList
                routines={routines}
                activeRoutineId={activeRoutineId}
                onSelectRoutine={setActiveRoutineId}
                onCreateRoutine={handleCreateRoutine}
                onDeleteRoutine={handleDeleteRoutine}
              />
            </div>

            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Routine Detail View */}
              <RoutineDetailView
                routine={activeRoutine}
                queueItems={queueItems}
                onUpdateRoutine={handleUpdateRoutine}
                onRemoveVideo={handleRemoveFromRoutine}
                onPlayVideo={handlePlayVideo}
                onLogWorkout={handleLogWorkout}
              />

              {/* Video Input Form */}
              <VideoInputForm onVideoAdded={handleVideoAdded} />

              {/* Video Library */}
              <VideoLibrary
                videos={videos}
                onAddToRoutine={handleAddToRoutine}
                onDeleteVideo={handleDeleteVideo}
                onPlayVideo={handlePlayVideo}
                onLogWorkout={handleLogWorkout}
                activeRoutine={activeRoutine}
              />
            </div>
          </div>
        </div>
      )}

      {/* Video Player Modal */}
      {playingVideo && (
        <VideoPlayer
          videoUrl={playingVideo.url}
          onClose={() => setPlayingVideo(null)}
        />
      )}

      {/* Workout Logger Modal */}
      {loggingVideo && (
        <WorkoutLogger
          videoId={loggingVideo._id}
          onClose={() => setLoggingVideo(null)}
        />
      )}

      {/* Segment Editor Modal */}
      {editingVideo && (
        <SegmentEditor
          video={editingVideo}
          segment={editingSegment}
          onClose={() => {
            setEditingSegment(null);
            setEditingVideo(null);
          }}
          onSave={handleSegmentSaved}
        />
      )}

      {/* Smart Player Modal */}
      {playingSegments && (
        <SmartPlayer
          segments={playingSegments}
          onClose={() => setPlayingSegments(null)}
        />
      )}
    </div>
  );
}

export default App;

