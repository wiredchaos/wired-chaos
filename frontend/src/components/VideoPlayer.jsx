import React, { useState, useEffect } from 'react';
import { Avatar, AvatarImage, AvatarFallback } from './ui/avatar';
import './VideoPlayer.css';

/**
 * VideoPlayer Component
 * 
 * Displays a video with optional avatar linking.
 * The avatar is only shown when avatarUrl is provided.
 * Videos without avatars display gracefully without any avatar UI.
 */
const VideoPlayer = ({ 
  videoId, 
  videoUrl, 
  title, 
  description, 
  thumbnailUrl,
  avatarUrl,  // Optional: can be null/undefined
  uploadedBy,
  duration,
  tags = [],
  onPlay,
  onPause,
  autoPlay = false,
  showControls = true,
  className = ''
}) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [hasAvatar] = useState(!!avatarUrl);

  useEffect(() => {
    // Log avatar status for debugging
    console.log(`Video "${title}" - Has Avatar: ${hasAvatar}`);
  }, [title, hasAvatar]);

  const handlePlay = () => {
    setIsPlaying(true);
    if (onPlay) onPlay(videoId);
  };

  const handlePause = () => {
    setIsPlaying(false);
    if (onPause) onPause(videoId);
  };

  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className={`video-player ${className}`}>
      {/* Video Header with Optional Avatar */}
      <div className="video-header">
        <div className="video-info">
          {/* Only render avatar if avatarUrl is provided */}
          {hasAvatar && (
            <Avatar className="video-avatar">
              <AvatarImage src={avatarUrl} alt={uploadedBy || 'User'} />
              <AvatarFallback>{(uploadedBy || 'U').charAt(0).toUpperCase()}</AvatarFallback>
            </Avatar>
          )}
          <div className="video-meta">
            <h3 className="video-title">{title}</h3>
            {uploadedBy && (
              <p className="video-uploader">
                {hasAvatar ? 'by ' : ''}{uploadedBy}
              </p>
            )}
          </div>
        </div>
        {duration && (
          <span className="video-duration">{formatDuration(duration)}</span>
        )}
      </div>

      {/* Video Player */}
      <div className="video-container">
        <video
          className="video-element"
          src={videoUrl}
          poster={thumbnailUrl}
          controls={showControls}
          autoPlay={autoPlay}
          onPlay={handlePlay}
          onPause={handlePause}
        >
          Your browser does not support the video tag.
        </video>
      </div>

      {/* Video Description */}
      {description && (
        <div className="video-description">
          <p>{description}</p>
        </div>
      )}

      {/* Tags */}
      {tags && tags.length > 0 && (
        <div className="video-tags">
          {tags.map((tag, index) => (
            <span key={index} className="video-tag">
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Avatar Status Indicator (for debugging/admin) */}
      {process.env.NODE_ENV === 'development' && (
        <div className="video-debug-info">
          <small>Avatar: {hasAvatar ? '✓ Linked' : '✗ Not linked'}</small>
        </div>
      )}
    </div>
  );
};

export default VideoPlayer;
