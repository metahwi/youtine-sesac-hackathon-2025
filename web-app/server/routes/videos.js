const express = require('express');
const router = express.Router();
const Video = require('../models/Video');
const Routine = require('../models/Routine');
const axios = require('axios');
const { analyzeVideo } = require('../services/aiAnalysis');
const { createLogger } = require('../utils/logger');

const logger = createLogger('videos');

/**
 * POST /api/videos
 * Add a new video by URL
 * Immediately returns video with 'pending' status
 * Triggers background AI analysis
 */
router.post('/', async (req, res) => {
  try {
    const { url } = req.body;

    if (!url) {
      return res.status(400).json({ error: 'Video URL is required' });
    }

    // Extract video ID
    const videoId = extractVideoId(url);
    if (!videoId) {
      return res.status(400).json({ error: 'Invalid YouTube URL' });
    }

    // Check if video already exists
    const existingVideo = await Video.findOne({ url });
    if (existingVideo) {
      return res.status(200).json(existingVideo);
    }

    logger.info(`Fetching metadata for video: ${videoId}`);
    
    let title = 'YouTube Video';
    let thumbnail = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
    let duration = 0;

    // Try YouTube Data API v3 if API key is available
    const youtubeApiKey = process.env.YOUTUBE_API_KEY;
    if (youtubeApiKey) {
      try {
        const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,contentDetails&key=${youtubeApiKey}`;
        const apiResponse = await axios.get(apiUrl, { timeout: 10000 });
        
        if (apiResponse.data && apiResponse.data.items && apiResponse.data.items.length > 0) {
          const videoData = apiResponse.data.items[0];
          
          // Get title
          if (videoData.snippet && videoData.snippet.title) {
            title = videoData.snippet.title;
          }
          
          // Get thumbnail (use maxres if available, otherwise high)
          if (videoData.snippet && videoData.snippet.thumbnails) {
            if (videoData.snippet.thumbnails.maxres) {
              thumbnail = videoData.snippet.thumbnails.maxres.url;
            } else if (videoData.snippet.thumbnails.high) {
              thumbnail = videoData.snippet.thumbnails.high.url;
            }
          }
          
          // Get duration and convert from ISO 8601 format (e.g., "PT15M33S") to seconds
          if (videoData.contentDetails && videoData.contentDetails.duration) {
            duration = parseISO8601Duration(videoData.contentDetails.duration);
          }
          
          logger.success(`Fetched via YouTube Data API: ${title} (${duration}s)`);
        }
      } catch (apiError) {
        logger.warn('YouTube Data API failed, falling back to oEmbed/scraping:', apiError.message);
      }
    }

    // Fallback to oEmbed API if YouTube Data API wasn't used or failed
    if (title === 'YouTube Video') {
      try {
        // Try YouTube oEmbed API (no auth required, but doesn't provide duration)
        const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
        const oembedResponse = await axios.get(oembedUrl, { timeout: 10000 });
        
        if (oembedResponse.data && oembedResponse.data.title) {
          title = oembedResponse.data.title;
          if (oembedResponse.data.thumbnail_url) {
            thumbnail = oembedResponse.data.thumbnail_url;
          }
          console.log(`Successfully fetched title via oEmbed: ${title}`);
        }
      } catch (oembedError) {
        console.log('oEmbed API failed, trying page scraping...');
      }
    }

    // Final fallback: Scrape the YouTube page for duration if still not found
    if (duration === 0) {
      try {
        const pageResponse = await axios.get(`https://www.youtube.com/watch?v=${videoId}`, {
          timeout: 10000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        });
        
        const html = pageResponse.data;
        
        // Extract title if still not found
        if (title === 'YouTube Video') {
          const titleMatch = html.match(/<meta name="title" content="([^"]+)"/);
          if (titleMatch && titleMatch[1]) {
            title = titleMatch[1];
            console.log(`Successfully scraped title: ${title}`);
          }
        }
        
        // Try to extract duration from page data
        const durationMatch = html.match(/"lengthSeconds":"(\d+)"/);
        if (durationMatch && durationMatch[1]) {
          duration = parseInt(durationMatch[1]);
          console.log(`Successfully scraped duration: ${duration}s`);
        }
        
      } catch (scrapeError) {
        console.log('Page scraping also failed, using defaults');
      }
    }

    // Create new video with fetched metadata and 'pending' status
    const newVideo = new Video({
      url,
      title,
      thumbnail,
      duration,
      status: 'pending', // AI analysis pending
      segments: []
    });

    await newVideo.save();
    logger.success(`Video saved: ${newVideo._id} (status: pending)`);

    // Immediately return the video to the frontend
    res.status(201).json(newVideo);

    // Trigger background AI analysis (non-blocking)
    performBackgroundAnalysis(newVideo._id, url, title);

  } catch (error) {
    logger.error('Error adding video:', error);
    res.status(500).json({ error: 'Failed to add video' });
  }
});

/**
 * Background function to analyze video with AI
 * Updates video document when complete
 */
async function performBackgroundAnalysis(videoId, videoUrl, videoTitle) {
  try {
    logger.info(`Starting background AI analysis for video ${videoId}`);
    
    // Check if OpenAI API key is available
    if (!process.env.OPENAI_API_KEY) {
      logger.warn('OpenAI API key not configured, skipping AI analysis');
      await Video.findByIdAndUpdate(videoId, {
        status: 'failed',
        analysisError: 'OpenAI API key not configured'
      });
      return;
    }

    // Perform AI analysis (handles all database updates internally)
    await analyzeVideo(videoId);
    logger.success(`AI analysis completed for video ${videoId}`);
  } catch (error) {
    logger.error(`Background AI analysis failed for video ${videoId}:`, error.message);
  }
}

/**
 * GET /api/videos
 * Retrieve all saved videos
 */
router.get('/', async (req, res) => {
  try {
    const videos = await Video.find().sort({ createdAt: -1 });
    res.status(200).json(videos);
  } catch (error) {
    logger.error('Error fetching videos:', error);
    res.status(500).json({ error: 'Failed to fetch videos' });
  }
});

/**
 * GET /api/videos/:id
 * Get a single video by ID with full details
 */
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);
    
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    res.status(200).json(video);
  } catch (error) {
    logger.error('Error fetching video:', error);
    res.status(500).json({ error: 'Failed to fetch video' });
  }
});

/**
 * DELETE /api/videos/:id
 * Delete a video and remove it from all routines
 */
router.delete('/:id', async (req, res) => {
  try {
    const { id } = req.params;
    
    // Delete the video
    const deletedVideo = await Video.findByIdAndDelete(id);
    
    if (!deletedVideo) {
      return res.status(404).json({ error: 'Video not found' });
    }
    
    // Remove this video from all routines
    await Routine.updateMany(
      { videos: id },
      { $pull: { videos: id } }
    );
    
    logger.info(`Video ${id} deleted and removed from all routines`);
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    logger.error('Error deleting video:', error);
    res.status(500).json({ error: 'Failed to delete video' });
  }
});

/**
 * Helper function to extract video ID from YouTube URL
 */
function extractVideoId(url) {
  const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
  const match = url.match(regex);
  return match ? match[1] : null;
}

/**
 * GET /api/videos/:id/segments
 * Get all segments from a specific video
 */
router.get('/:id/segments', async (req, res) => {
  try {
    const ExerciseSegment = require('../models/ExerciseSegment');
    const segments = await ExerciseSegment.find({ sourceVideoId: req.params.id })
      .sort({ startTime: 1 });

    logger.info(`Fetched ${segments.length} segments for video ${req.params.id}`);
    res.status(200).json(segments);
  } catch (error) {
    logger.error('Error fetching video segments:', error);
    res.status(500).json({ error: 'Failed to fetch segments' });
  }
});

/**
 * Helper function to parse ISO 8601 duration format (e.g., "PT15M33S") to seconds
 */
function parseISO8601Duration(duration) {
  const match = duration.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) return 0;

  const hours = parseInt(match[1]) || 0;
  const minutes = parseInt(match[2]) || 0;
  const seconds = parseInt(match[3]) || 0;

  return hours * 3600 + minutes * 60 + seconds;
}

module.exports = router;

