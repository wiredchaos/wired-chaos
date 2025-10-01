import React, { useState, useEffect } from 'react';
import VideoPlayer from './VideoPlayer';
import './VideoList.css';

/**
 * VideoList Component
 * 
 * Displays a list/grid of videos with optional avatar filtering.
 * Handles videos both with and without avatars gracefully.
 */
const VideoList = ({ 
  layout = 'grid',  // 'grid' or 'list'
  filterByAvatar = null,  // null, true, or false
  apiBaseUrl = '/api'
}) => {
  const [videos, setVideos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    loadVideos();
    loadStats();
  }, [filterByAvatar]);

  const loadVideos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      let url = `${apiBaseUrl}/videos`;
      const params = new URLSearchParams();
      
      if (filterByAvatar !== null) {
        params.append('has_avatar', filterByAvatar);
      }
      
      if (params.toString()) {
        url += `?${params.toString()}`;
      }
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to load videos');
      }
      
      const data = await response.json();
      setVideos(data.videos || []);
    } catch (err) {
      setError(err.message);
      console.error('Error loading videos:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadStats = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/videos/stats/summary`);
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (err) {
      console.error('Error loading stats:', err);
    }
  };

  const handleVideoPlay = (videoId) => {
    // Increment view count
    fetch(`${apiBaseUrl}/videos/${videoId}/views`, { method: 'POST' })
      .catch(err => console.error('Error tracking view:', err));
  };

  if (loading) {
    return (
      <div className="video-list-loading">
        <div className="spinner"></div>
        <p>Loading videos...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="video-list-error">
        <p>⚠️ Error: {error}</p>
        <button onClick={loadVideos} className="retry-button">
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="video-list-container">
      {/* Stats Bar */}
      {stats && (
        <div className="video-stats-bar">
          <div className="stat-item">
            <span className="stat-value">{stats.total_videos}</span>
            <span className="stat-label">Total Videos</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.videos_with_avatars}</span>
            <span className="stat-label">With Avatars</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">{stats.videos_without_avatars}</span>
            <span className="stat-label">Without Avatars</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">
              {stats.avatar_usage_percentage.toFixed(1)}%
            </span>
            <span className="stat-label">Avatar Usage</span>
          </div>
        </div>
      )}

      {/* Filter Info */}
      {filterByAvatar !== null && (
        <div className="filter-info">
          <p>
            Showing videos {filterByAvatar ? 'with' : 'without'} avatars
            <button onClick={() => window.location.reload()} className="clear-filter">
              Clear Filter
            </button>
          </p>
        </div>
      )}

      {/* Video List */}
      {videos.length === 0 ? (
        <div className="no-videos">
          <p>No videos found</p>
          {filterByAvatar !== null && (
            <p className="hint">Try removing the avatar filter</p>
          )}
        </div>
      ) : (
        <div className={`video-list ${layout}`}>
          {videos.map((video) => (
            <VideoPlayer
              key={video.id}
              videoId={video.id}
              videoUrl={video.video_url}
              title={video.title}
              description={video.description}
              thumbnailUrl={video.thumbnail_url}
              avatarUrl={video.avatar_url}  // Can be null/undefined
              uploadedBy={video.uploaded_by}
              duration={video.duration}
              tags={video.tags}
              onPlay={handleVideoPlay}
              showControls={true}
              className={layout === 'grid' ? 'video-grid-item' : 'video-list-item'}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default VideoList;
