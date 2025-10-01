/**
 * WIRED CHAOS - Video Player Component
 * 
 * Displays videos with optional avatar support.
 * Videos can be displayed with or without avatars - both modes are fully supported.
 * 
 * Features:
 * - Optional avatar display (top-right corner by default)
 * - Graceful fallback when avatar is not provided
 * - Configurable avatar position and size
 * - Cyberpunk/WIRED CHAOS styling
 */

import React, { useState, useRef, useEffect } from 'react';
import './VideoPlayer.css';

const VideoPlayer = ({ 
  video,
  config = {},
  onVideoEnd = null,
  onViewCountUpdate = null,
  className = ''
}) => {
  const {
    autoplay = false,
    controls = true,
    muted = false,
    loop = false,
    showAvatar = true, // Show avatar if available
    avatarPosition = 'top-right',
    avatarSize = 'medium'
  } = config;

  const [isPlaying, setIsPlaying] = useState(false);
  const [hasStarted, setHasStarted] = useState(false);
  const videoRef = useRef(null);

  // Track view count on first play
  useEffect(() => {
    if (hasStarted && onViewCountUpdate && video?.id) {
      onViewCountUpdate(video.id);
    }
  }, [hasStarted, onViewCountUpdate, video?.id]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (!hasStarted) {
      setHasStarted(true);
    }
  };

  const handlePause = () => {
    setIsPlaying(false);
  };

  const handleEnded = () => {
    setIsPlaying(false);
    if (onVideoEnd) {
      onVideoEnd(video);
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  // Determine if avatar should be displayed
  const shouldShowAvatar = showAvatar && video?.avatar;

  return (
    <div className={`video-player-container ${className}`}>
      {/* Video Title */}
      {video?.title && (
        <div className="video-header">
          <h3 className="video-title">{video.title}</h3>
          {video.duration && (
            <span className="video-duration">{formatDuration(video.duration)}</span>
          )}
        </div>
      )}

      {/* Video Player */}
      <div className="video-wrapper">
        {video?.url ? (
          <>
            <video
              ref={videoRef}
              src={video.url}
              poster={video.thumbnail_url}
              autoPlay={autoplay}
              controls={controls}
              muted={muted}
              loop={loop}
              onPlay={handlePlay}
              onPause={handlePause}
              onEnded={handleEnded}
              className="video-element"
            />
            
            {/* Optional Avatar Overlay - only shown if avatar is provided */}
            {shouldShowAvatar && (
              <div 
                className={`video-avatar-overlay ${avatarPosition} ${avatarSize}`}
                title={video.created_by || 'Video creator'}
              >
                <img 
                  src={video.avatar} 
                  alt="Creator avatar"
                  onError={(e) => {
                    // Hide avatar on load error
                    e.target.parentElement.style.display = 'none';
                  }}
                />
              </div>
            )}
          </>
        ) : (
          <div className="video-placeholder">
            <p>No video URL provided</p>
          </div>
        )}
      </div>

      {/* Video Info */}
      {video && (
        <div className="video-info">
          {video.description && (
            <p className="video-description">{video.description}</p>
          )}
          
          <div className="video-meta">
            {video.view_count !== undefined && (
              <span className="video-views">
                👁️ {video.view_count} views
              </span>
            )}
            
            {video.tags && video.tags.length > 0 && (
              <div className="video-tags">
                {video.tags.map((tag, idx) => (
                  <span key={idx} className="video-tag">#{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * Video Grid Component
 * Displays multiple videos in a grid layout
 */
export const VideoGrid = ({ 
  videos = [], 
  onVideoClick = null,
  showAvatars = true,
  className = ''
}) => {
  return (
    <div className={`video-grid ${className}`}>
      {videos.map(video => (
        <div 
          key={video.id} 
          className="video-grid-item"
          onClick={() => onVideoClick && onVideoClick(video)}
        >
          <div className="video-thumbnail">
            {video.thumbnail_url ? (
              <img src={video.thumbnail_url} alt={video.title} />
            ) : (
              <div className="thumbnail-placeholder">
                🎬
              </div>
            )}
            
            {/* Optional avatar badge on thumbnail */}
            {showAvatars && video.avatar && (
              <div className="thumbnail-avatar-badge">
                <img src={video.avatar} alt="Creator" />
              </div>
            )}
            
            {video.duration && (
              <span className="thumbnail-duration">
                {Math.floor(video.duration / 60)}:{(video.duration % 60).toString().padStart(2, '0')}
              </span>
            )}
          </div>
          
          <div className="video-grid-info">
            <h4>{video.title}</h4>
            {video.view_count !== undefined && (
              <span className="grid-views">👁️ {video.view_count}</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default VideoPlayer;
