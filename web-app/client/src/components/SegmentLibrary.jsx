import { useState, useEffect } from 'react';
import { Search, Grid, Video as VideoIcon } from 'lucide-react';
import { segmentAPI, videoAPI } from '../services/api';
import SegmentCard from './SegmentCard';
import VideoCard from './VideoCard';
import { useLanguage } from '../contexts/LanguageContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('SegmentLibrary');

/**
 * SegmentLibrary Component
 * Main library view for browsing exercise segments
 * Enhancement 2: Unified UI with toggle between Segment/Video view
 */
const SegmentLibrary = ({
  onAddToRoutine,
  onEditSegment,
  onDeleteSegment,
  onPlaySegment,
  activeRoutine
}) => {
  const { t } = useLanguage();
  const [viewMode, setViewMode] = useState('segments'); // 'segments' or 'videos'
  const [segments, setSegments] = useState([]);
  const [videos, setVideos] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMuscle, setSelectedMuscle] = useState('');
  const [selectedVideoId, setSelectedVideoId] = useState('');
  const [muscleGroups, setMuscleGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data on mount and when filters change
  useEffect(() => {
    if (viewMode === 'segments') {
      fetchSegments();
    } else {
      fetchVideos();
    }
    fetchMuscleGroups();
  }, [viewMode, searchTerm, selectedMuscle, selectedVideoId, activeRoutine?._id]);

  const fetchSegments = async () => {
    try {
      setLoading(true);
      const filters = {};
      if (searchTerm) filters.search = searchTerm;
      if (selectedMuscle) filters.muscleGroup = selectedMuscle;
      if (selectedVideoId) filters.videoId = selectedVideoId;
      if (activeRoutine?._id) filters.routineId = activeRoutine._id;

      const data = await segmentAPI.getAllSegments(filters);
      setSegments(data);
    } catch (error) {
      logger.error('Error fetching segments:', error);
      setSegments([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const data = await videoAPI.getAllVideos();
      setVideos(data);
    } catch (error) {
      logger.error('Error fetching videos:', error);
      setVideos([]);
    } finally {
      setLoading(false);
    }
  };

  const fetchMuscleGroups = async () => {
    try {
      const data = await segmentAPI.getMuscleGroups();
      setMuscleGroups(data);
    } catch (error) {
      logger.error('Error fetching muscle groups:', error);
    }
  };

  const handleVideoClick = (videoId) => {
    setViewMode('segments');
    setSelectedVideoId(videoId);
  };

  const handleClearFilters = () => {
    setSearchTerm('');
    setSelectedMuscle('');
    setSelectedVideoId('');
  };

  return (
    <div className="fire-card rounded-lg p-6">
      {/* Header with View Toggle */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold gold-glow">{t('exerciseLibrary') || 'Exercise Library'}</h2>

        {/* View Mode Toggle */}
        <div className="flex gap-2 bg-white/10 p-1 rounded-lg">
          <button
            onClick={() => {
              setViewMode('segments');
              setSelectedVideoId('');
            }}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-bold uppercase text-xs tracking-wider ${
              viewMode === 'segments'
                ? 'bg-black text-white border-2 border-white'
                : 'text-white hover:bg-white/10'
            }`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <Grid className="w-4 h-4" />
            {t('segments') || 'Segments'}
          </button>
          <button
            onClick={() => setViewMode('videos')}
            className={`flex items-center gap-2 px-4 py-2 rounded-md transition-colors font-bold uppercase text-xs tracking-wider ${
              viewMode === 'videos'
                ? 'bg-black text-white border-2 border-white'
                : 'text-white hover:bg-white/10'
            }`}
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <VideoIcon className="w-4 h-4" />
            {t('videos') || 'Videos'}
          </button>
        </div>
      </div>

      {/* Filters (only for segment view) */}
      {viewMode === 'segments' && (
        <div className="mb-6 space-y-3">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-white/50 w-5 h-5" />
            <input
              type="text"
              placeholder={t('searchExercises') || 'Search exercises...'}
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-white/10 border-2 border-white/20 text-white placeholder-white/50 rounded-lg focus:ring-2 focus:ring-white focus:border-white"
            />
          </div>

          {/* Filter Row */}
          <div className="flex gap-3">
            <select
              value={selectedMuscle}
              onChange={(e) => setSelectedMuscle(e.target.value)}
              className="flex-1 px-4 py-2 bg-white/10 border-2 border-white/20 text-white rounded-lg focus:ring-2 focus:ring-white focus:border-white"
              style={{ colorScheme: 'dark' }}
            >
              <option value="" style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>{t('allMuscles') || 'All Muscles'}</option>
              {muscleGroups.map((muscle) => (
                <option key={muscle} value={muscle} style={{ backgroundColor: '#0A0A0A', color: '#FFFFFF' }}>
                  {muscle}
                </option>
              ))}
            </select>

            {(searchTerm || selectedMuscle || selectedVideoId) && (
              <button
                onClick={handleClearFilters}
                className="px-4 py-2 bg-white hover:bg-gray-100 text-black rounded-lg transition-colors font-bold uppercase text-xs tracking-wider border-2 border-black"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('clearFilters') || 'Clear Filters'}
              </button>
            )}
          </div>

          {/* Active Filters Info */}
          {selectedVideoId && (
            <div className="bg-white/10 border border-white/30 rounded-lg p-3 flex items-center justify-between">
              <span className="text-sm text-white">
                {t('filteringByVideo') || 'Filtering by selected video'}
              </span>
              <button
                onClick={() => setSelectedVideoId('')}
                className="text-white hover:text-white/80 text-sm font-bold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                {t('showAll') || 'Show All'}
              </button>
            </div>
          )}
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('loading') || 'Loading...'}...</p>
        </div>
      )}

      {/* Empty State */}
      {!loading && viewMode === 'segments' && segments.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-2">{t('noSegments') || 'No exercise segments found'}</p>
          <p className="text-sm text-gray-400">
            {t('addVideosFirst') || 'Add YouTube videos to automatically extract exercise segments'}
          </p>
        </div>
      )}

      {!loading && viewMode === 'videos' && videos.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">{t('noVideos') || 'No videos found'}</p>
        </div>
      )}

      {/* Segment Grid */}
      {!loading && viewMode === 'segments' && segments.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {segments.map((segment) => (
            <SegmentCard
              key={segment._id}
              segment={segment}
              onAdd={() => onAddToRoutine(segment._id)}
              onPlay={onPlaySegment}
              onEdit={onEditSegment}
              onDelete={onDeleteSegment}
              showAddButton={!!activeRoutine}
              showEditButton={true}
              showDeleteButton={true}
            />
          ))}
        </div>
      )}

      {/* Video Grid (Enhancement 2: Click video to filter segments) */}
      {!loading && viewMode === 'videos' && videos.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {videos.map((video) => (
            <div
              key={video._id}
              onClick={() => handleVideoClick(video._id)}
              className="cursor-pointer"
            >
              <VideoCard
                video={video}
                onAdd={() => {}} // Not used in video mode
                onDelete={() => {}} // Not used in video mode
                onCreateSegment={(video) => {
                  // Open SegmentEditor for manual segment creation
                  onEditSegment(null, video);
                }}
                showAddButton={false}
                showDeleteButton={false}
                showAnalysisStatus={true}
                showCreateSegmentButton={video.status === 'failed'}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default SegmentLibrary;
