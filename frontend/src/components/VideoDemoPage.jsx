import React, { useState, useEffect } from 'react';
import VideoList from './VideoList';
import VideoPlayer from './VideoPlayer';
import './VideoDemoPage.css';

/**
 * Video Demo Page
 * 
 * Demonstrates the video system with optional avatar linking.
 * Shows examples of both videos with avatars and without avatars.
 */
const VideoDemoPage = () => {
  const [viewMode, setViewMode] = useState('all'); // 'all', 'with-avatar', 'without-avatar'
  const [demoVideos, setDemoVideos] = useState([]);

  useEffect(() => {
    // Load demo data or fetch from API
    loadDemoVideos();
  }, []);

  const loadDemoVideos = () => {
    // Demo videos - mix of with and without avatars
    const demos = [
      {
        id: 'demo-1',
        title: 'Welcome to WIRED CHAOS',
        description: 'Introduction to the WIRED CHAOS platform and ecosystem',
        video_url: 'https://example.com/welcome.mp4',
        thumbnail_url: 'https://example.com/thumbnails/welcome.jpg',
        avatar_url: 'https://i.pravatar.cc/150?img=1', // Has avatar
        uploaded_by: 'NeuroMeta',
        duration: 180,
        tags: ['welcome', 'intro', 'wired-chaos'],
        views: 1247
      },
      {
        id: 'demo-2',
        title: 'AR/VR Model Viewer Tutorial',
        description: 'Learn how to use the 3D model viewer for AR experiences',
        video_url: 'https://example.com/ar-tutorial.mp4',
        thumbnail_url: 'https://example.com/thumbnails/ar-tutorial.jpg',
        avatar_url: null, // No avatar
        uploaded_by: 'Tech Team',
        duration: 420,
        tags: ['tutorial', 'ar', 'vr'],
        views: 856
      },
      {
        id: 'demo-3',
        title: 'Vault33 Quest Guide',
        description: 'Complete walkthrough of Vault33 quests and rewards',
        video_url: 'https://example.com/vault33.mp4',
        thumbnail_url: 'https://example.com/thumbnails/vault33.jpg',
        avatar_url: 'https://i.pravatar.cc/150?img=3', // Has avatar
        uploaded_by: 'VaultKeeper',
        duration: 600,
        tags: ['vault33', 'quest', 'guide'],
        views: 2134
      },
      {
        id: 'demo-4',
        title: '33.3 FM Broadcast Highlights',
        description: 'Best moments from last week\'s broadcasts',
        video_url: 'https://example.com/fm333.mp4',
        thumbnail_url: 'https://example.com/thumbnails/fm333.jpg',
        avatar_url: null, // No avatar
        uploaded_by: 'Radio Team',
        duration: 300,
        tags: ['fm333', 'radio', 'highlights'],
        views: 445
      },
      {
        id: 'demo-5',
        title: 'NEURO Lab Deep Dive',
        description: 'Explore the features and tools in NEURO Lab',
        video_url: 'https://example.com/neuro.mp4',
        thumbnail_url: 'https://example.com/thumbnails/neuro.jpg',
        avatar_url: 'https://i.pravatar.cc/150?img=5', // Has avatar
        uploaded_by: 'Dr. Neural',
        duration: 540,
        tags: ['neuro', 'lab', 'tutorial'],
        views: 1892
      },
      {
        id: 'demo-6',
        title: 'Community Showcase',
        description: 'Amazing creations from our community members',
        video_url: 'https://example.com/community.mp4',
        thumbnail_url: 'https://example.com/thumbnails/community.jpg',
        avatar_url: null, // No avatar
        uploaded_by: 'Community',
        duration: 240,
        tags: ['community', 'showcase'],
        views: 678
      }
    ];

    setDemoVideos(demos);
  };

  const getFilteredVideos = () => {
    if (viewMode === 'with-avatar') {
      return demoVideos.filter(v => v.avatar_url);
    } else if (viewMode === 'without-avatar') {
      return demoVideos.filter(v => !v.avatar_url);
    }
    return demoVideos;
  };

  const filteredVideos = getFilteredVideos();
  const statsWithAvatar = demoVideos.filter(v => v.avatar_url).length;
  const statsWithoutAvatar = demoVideos.filter(v => !v.avatar_url).length;

  return (
    <div className="video-demo-page">
      {/* Header */}
      <div className="demo-header">
        <h1>🎬 WIRED CHAOS Video System</h1>
        <p className="demo-subtitle">
          Demonstrating optional avatar linking for videos
        </p>
      </div>

      {/* Info Panel */}
      <div className="info-panel">
        <div className="info-card">
          <h3>✅ Optional Avatar Linking</h3>
          <p>
            Videos can exist with or without avatars. The UI gracefully handles both states,
            ensuring a seamless experience regardless of avatar presence.
          </p>
        </div>

        <div className="info-stats">
          <div className="stat-box">
            <div className="stat-number">{demoVideos.length}</div>
            <div className="stat-label">Total Videos</div>
          </div>
          <div className="stat-box highlight">
            <div className="stat-number">{statsWithAvatar}</div>
            <div className="stat-label">With Avatars</div>
          </div>
          <div className="stat-box">
            <div className="stat-number">{statsWithoutAvatar}</div>
            <div className="stat-label">Without Avatars</div>
          </div>
        </div>
      </div>

      {/* Filter Controls */}
      <div className="filter-controls">
        <h3>Filter Videos:</h3>
        <div className="filter-buttons">
          <button
            className={`filter-btn ${viewMode === 'all' ? 'active' : ''}`}
            onClick={() => setViewMode('all')}
          >
            🎬 All Videos ({demoVideos.length})
          </button>
          <button
            className={`filter-btn ${viewMode === 'with-avatar' ? 'active' : ''}`}
            onClick={() => setViewMode('with-avatar')}
          >
            👤 With Avatars ({statsWithAvatar})
          </button>
          <button
            className={`filter-btn ${viewMode === 'without-avatar' ? 'active' : ''}`}
            onClick={() => setViewMode('without-avatar')}
          >
            📹 Without Avatars ({statsWithoutAvatar})
          </button>
        </div>
      </div>

      {/* Video Grid */}
      <div className="video-grid-demo">
        {filteredVideos.map((video) => (
          <div key={video.id} className="video-card-wrapper">
            <VideoPlayer
              videoId={video.id}
              videoUrl={video.video_url}
              title={video.title}
              description={video.description}
              thumbnailUrl={video.thumbnail_url}
              avatarUrl={video.avatar_url}
              uploadedBy={video.uploaded_by}
              duration={video.duration}
              tags={video.tags}
              showControls={true}
            />
            
            {/* Status Badge */}
            <div className="video-status-badge">
              {video.avatar_url ? (
                <span className="badge has-avatar">✓ Has Avatar</span>
              ) : (
                <span className="badge no-avatar">○ No Avatar</span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {filteredVideos.length === 0 && (
        <div className="empty-state">
          <p>No videos match the current filter</p>
        </div>
      )}

      {/* Documentation Link */}
      <div className="documentation-link">
        <a href="/VIDEO_AVATAR_DOCUMENTATION.md" target="_blank" rel="noopener noreferrer">
          📚 View Complete Documentation
        </a>
      </div>
    </div>
  );
};

export default VideoDemoPage;
