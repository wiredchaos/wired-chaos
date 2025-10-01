/**
 * WIRED CHAOS - Video Demo Page
 * Demonstrates video player with optional avatar support
 */

import React, { useState } from 'react';
import VideoPlayer, { VideoGrid } from './VideoPlayer';
import './VideoDemo.css';

const VideoDemo = () => {
  const [selectedVideo, setSelectedVideo] = useState(null);

  // Sample videos - mix of with and without avatars
  const demoVideos = [
    {
      id: 'demo-1',
      title: 'WIRED CHAOS Introduction',
      description: 'Welcome to the WIRED CHAOS ecosystem - Web3 powered by chaos and creativity',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
      thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/BigBuckBunny.jpg',
      duration: 596,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=wired', // ✅ Has avatar
      created_by: 'NeuroMeta',
      created_at: '2025-01-01T00:00:00Z',
      updated_at: '2025-01-01T00:00:00Z',
      tags: ['intro', 'web3', 'chaos'],
      status: 'published',
      view_count: 1234
    },
    {
      id: 'demo-2',
      title: 'NFT Collection Reveal',
      description: 'Exclusive first look at our latest NFT drop on XRPL',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
      thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ElephantsDream.jpg',
      duration: 653,
      avatar: null, // ⚠️ No avatar
      created_by: null,
      created_at: '2025-01-02T00:00:00Z',
      updated_at: '2025-01-02T00:00:00Z',
      tags: ['nft', 'collection', 'xrpl'],
      status: 'published',
      view_count: 567
    },
    {
      id: 'demo-3',
      title: 'Vault33 Gatekeeper Tutorial',
      description: 'Learn how to unlock Merovingian fragments and earn WL points',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
      thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerBlazes.jpg',
      duration: 15,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=vault33', // ✅ Has avatar
      created_by: 'Vault33Bot',
      created_at: '2025-01-03T00:00:00Z',
      updated_at: '2025-01-03T00:00:00Z',
      tags: ['vault33', 'tutorial', 'gamification'],
      status: 'published',
      view_count: 890
    },
    {
      id: 'demo-4',
      title: 'Community Highlights',
      description: 'Amazing creations from our community members',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4',
      thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerEscapes.jpg',
      duration: 15,
      avatar: null, // ⚠️ No avatar
      created_by: null,
      created_at: '2025-01-04T00:00:00Z',
      updated_at: '2025-01-04T00:00:00Z',
      tags: ['community', 'showcase'],
      status: 'published',
      view_count: 432
    },
    {
      id: 'demo-5',
      title: '33.3FM Radio Session',
      description: 'Live broadcast from the Dogechain radio station',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
      thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerFun.jpg',
      duration: 60,
      avatar: 'https://api.dicebear.com/7.x/avataaars/svg?seed=fm333', // ✅ Has avatar
      created_by: 'FM333_DJ',
      created_at: '2025-01-05T00:00:00Z',
      updated_at: '2025-01-05T00:00:00Z',
      tags: ['radio', 'music', 'live'],
      status: 'published',
      view_count: 2100
    },
    {
      id: 'demo-6',
      title: 'Anonymous Tech Demo',
      description: 'Technical demonstration of our AR/VR integration',
      url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
      thumbnail_url: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/images/ForBiggerJoyrides.jpg',
      duration: 15,
      avatar: null, // ⚠️ No avatar
      created_by: null,
      created_at: '2025-01-06T00:00:00Z',
      updated_at: '2025-01-06T00:00:00Z',
      tags: ['tech', 'ar', 'vr'],
      status: 'published',
      view_count: 678
    }
  ];

  const handleVideoClick = (video) => {
    setSelectedVideo(video);
  };

  const handleViewUpdate = (videoId) => {
    console.log(`📊 View tracked for video: ${videoId}`);
    // In production, would call API endpoint
  };

  return (
    <div className="video-demo-page">
      <header className="demo-header">
        <h1 className="demo-title">🎬 WIRED CHAOS Video System</h1>
        <p className="demo-subtitle">
          Optional Avatar Linking Demo - Videos work perfectly with or without avatars
        </p>
      </header>

      {/* Info Cards */}
      <div className="info-cards">
        <div className="info-card avatar-yes">
          <div className="card-icon">✅</div>
          <h3>With Avatar</h3>
          <p>Videos can include creator avatars for personalization</p>
        </div>
        <div className="info-card avatar-no">
          <div className="card-icon">⚠️</div>
          <h3>Without Avatar</h3>
          <p>Videos work perfectly without avatars - no errors or placeholders</p>
        </div>
        <div className="info-card avatar-flex">
          <div className="card-icon">🔄</div>
          <h3>Flexible</h3>
          <p>Avatars can be added, updated, or removed at any time</p>
        </div>
      </div>

      {/* Video Grid */}
      <section className="demo-section">
        <h2 className="section-title">Video Gallery (Mixed Avatars)</h2>
        <p className="section-description">
          Grid showing videos with and without avatars. Notice how some have avatar badges and some don't - both work perfectly.
        </p>
        <VideoGrid 
          videos={demoVideos}
          showAvatars={true}
          onVideoClick={handleVideoClick}
        />
      </section>

      {/* Selected Video Player */}
      {selectedVideo && (
        <section className="demo-section">
          <h2 className="section-title">Selected Video</h2>
          <p className="section-description">
            {selectedVideo.avatar 
              ? '✅ This video has an avatar in the top-right corner'
              : '⚠️ This video has no avatar - notice the clean display'}
          </p>
          <VideoPlayer 
            video={selectedVideo}
            config={{
              controls: true,
              showAvatar: true,
              avatarPosition: 'top-right',
              avatarSize: 'medium'
            }}
            onViewCountUpdate={handleViewUpdate}
          />
        </section>
      )}

      {/* Avatar Position Demo */}
      <section className="demo-section">
        <h2 className="section-title">Avatar Position Options</h2>
        <p className="section-description">
          When a video has an avatar, it can be positioned in different corners
        </p>
        <div className="position-demo-grid">
          {['top-left', 'top-right', 'bottom-left', 'bottom-right'].map(position => (
            <div key={position} className="position-demo-item">
              <h4>{position}</h4>
              <VideoPlayer 
                video={{
                  ...demoVideos[0],
                  title: `Avatar: ${position}`
                }}
                config={{
                  controls: true,
                  showAvatar: true,
                  avatarPosition: position,
                  avatarSize: 'medium'
                }}
              />
            </div>
          ))}
        </div>
      </section>

      {/* Stats Section */}
      <section className="demo-section stats-section">
        <h2 className="section-title">Video Statistics</h2>
        <div className="stats-grid">
          <div className="stat-card">
            <div className="stat-value">{demoVideos.length}</div>
            <div className="stat-label">Total Videos</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {demoVideos.filter(v => v.avatar).length}
            </div>
            <div className="stat-label">With Avatars</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {demoVideos.filter(v => !v.avatar).length}
            </div>
            <div className="stat-label">Without Avatars</div>
          </div>
          <div className="stat-card">
            <div className="stat-value">
              {demoVideos.reduce((sum, v) => sum + v.view_count, 0).toLocaleString()}
            </div>
            <div className="stat-label">Total Views</div>
          </div>
        </div>
      </section>

      {/* Documentation Link */}
      <footer className="demo-footer">
        <p>
          📖 See <code>VIDEO_AVATAR_DOCUMENTATION.md</code> and <code>VIDEO_SYSTEM_README.md</code> for complete documentation
        </p>
      </footer>
    </div>
  );
};

export default VideoDemo;
