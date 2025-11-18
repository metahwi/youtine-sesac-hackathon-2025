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
    <div className="fire-card rounded-lg p-6 mb-6">
      <h2 className="text-2xl mb-4 gold-glow" style={{ fontFamily: 'var(--font-display)' }}>
        {t('addNewVideo')}
      </h2>

      <form onSubmit={handleSubmit} className="flex gap-3">
        <input
          type="text"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder={t('pasteUrl')}
          className="flex-1 px-5 py-3 bg-white/10 border-2 border-white/20 text-white placeholder-white/50 rounded-lg focus:outline-none focus:ring-2 focus:ring-white focus:border-white transition-all"
          disabled={loading}
        />

        <button
          type="submit"
          disabled={loading}
          className="champion-button disabled:opacity-50 disabled:cursor-not-allowed px-8 py-3 rounded-lg flex items-center gap-2"
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

