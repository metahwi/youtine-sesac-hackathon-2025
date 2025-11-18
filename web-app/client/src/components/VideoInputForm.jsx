import { useState } from 'react';
import { Plus, Loader2 } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * VideoInputForm Component
 * Form to add a new video by URL
 */
const VideoInputForm = ({ onVideoAdded }) => {
  const { t } = useLanguage();
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!url.trim()) {
      setError('Please enter a video URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await onVideoAdded(url);
      setUrl('');
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to add video. Please check the URL and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-6">
      <h2 className="text-lg font-semibold mb-3">{t('addNewVideo')}</h2>
      
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t('pasteUrl')}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FFE01E] focus:border-transparent"
          disabled={loading}
        />
        
        <button
          type="submit"
          disabled={loading}
          className="bg-[#FFE01E] hover:bg-[#F5D000] disabled:bg-gray-300 text-black px-6 py-2 rounded-md font-semibold transition-colors duration-200 flex items-center gap-2"
        >
          {loading ? (
            <>
              <Loader2 size={18} className="animate-spin" />
              {t('addVideo')}...
            </>
          ) : (
            <>
              <Plus size={18} />
              {t('addVideo')}
            </>
          )}
        </button>
      </form>
      
      {error && (
        <p className="mt-2 text-sm text-red-600">{error === 'Invalid YouTube URL' ? t('invalidUrl') : error}</p>
      )}
    </div>
  );
};

export default VideoInputForm;

