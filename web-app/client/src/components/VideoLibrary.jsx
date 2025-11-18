import VideoCard from './VideoCard';
import { useLanguage } from '../contexts/LanguageContext';
import { createLogger } from '../utils/logger';

const logger = createLogger('VideoLibrary');

/**
 * VideoLibrary Component
 * Displays all saved videos in a grid layout
 */
const VideoLibrary = ({ videos, onAddToRoutine, onDeleteVideo, onPlayVideo, onLogWorkout, activeRoutine }) => {
  const { t } = useLanguage();

  // Defensive check: ensure videos is an array
  if (!Array.isArray(videos)) {
    logger.error('VideoLibrary received non-array videos prop:', typeof videos, videos);
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-red-500">Error loading videos. Please refresh the page.</p>
      </div>
    );
  }

  if (videos.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-8 text-center">
        <p className="text-gray-500">{t('noVideos')}</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 rounded-lg p-4">
      <h2 className="text-lg font-semibold mb-4">{t('videoLibrary')}</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video) => (
          <VideoCard
            key={video._id}
            video={video}
            onAdd={onAddToRoutine}
            onDelete={onDeleteVideo}
            onPlay={onPlayVideo}
            onLogWorkout={onLogWorkout}
            showAddButton={!!activeRoutine}
            showRemoveButton={false}
            showDeleteButton={true}
            showLogButton={true}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoLibrary;

