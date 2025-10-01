/**
 * WIRED CHAOS - Video Player Usage Examples
 * 
 * This file demonstrates how to use the VideoPlayer component
 * with optional avatar support.
 */

import React from 'react';
import VideoPlayer, { VideoGrid } from './VideoPlayer';

// ========== Example 1: Video WITH Avatar ==========
export const VideoWithAvatarExample = () => {
  const videoWithAvatar = {
    id: 'demo-1',
    title: 'WIRED CHAOS Tutorial - Web3 Basics',
    description: 'Learn the fundamentals of Web3 technology',
    url: 'https://example.com/videos/web3-tutorial.mp4',
    thumbnail_url: 'https://example.com/thumbnails/web3.jpg',
    duration: 300, // 5 minutes
    avatar: 'https://example.com/avatars/neuro-meta.jpg', // ✅ Avatar provided
    created_by: 'neuro-meta',
    view_count: 1234,
    tags: ['web3', 'tutorial', 'blockchain'],
    status: 'published'
  };

  return (
    <VideoPlayer 
      video={videoWithAvatar}
      config={{
        controls: true,
        showAvatar: true, // Avatar will be displayed in top-right corner
        avatarPosition: 'top-right',
        avatarSize: 'medium'
      }}
    />
  );
};

// ========== Example 2: Video WITHOUT Avatar ==========
export const VideoWithoutAvatarExample = () => {
  const videoWithoutAvatar = {
    id: 'demo-2',
    title: 'NFT Collection Showcase',
    description: 'Explore our latest NFT drops',
    url: 'https://example.com/videos/nft-showcase.mp4',
    thumbnail_url: 'https://example.com/thumbnails/nft.jpg',
    duration: 180, // 3 minutes
    avatar: null, // ⚠️ No avatar - video will display without avatar overlay
    created_by: null,
    view_count: 567,
    tags: ['nft', 'collection', 'showcase'],
    status: 'published'
  };

  return (
    <VideoPlayer 
      video={videoWithoutAvatar}
      config={{
        controls: true,
        showAvatar: true // Won't show anything since avatar is null
      }}
    />
  );
};

// ========== Example 3: Mixed Video Grid ==========
export const MixedVideoGridExample = () => {
  const mixedVideos = [
    {
      id: 'grid-1',
      title: 'Creator Video',
      url: 'video1.mp4',
      thumbnail_url: 'thumb1.jpg',
      avatar: 'https://example.com/avatars/creator1.jpg', // Has avatar
      view_count: 1000,
      duration: 120
    },
    {
      id: 'grid-2',
      title: 'Anonymous Upload',
      url: 'video2.mp4',
      thumbnail_url: 'thumb2.jpg',
      avatar: null, // No avatar
      view_count: 500,
      duration: 90
    },
    {
      id: 'grid-3',
      title: 'Community Video',
      url: 'video3.mp4',
      thumbnail_url: 'thumb3.jpg',
      avatar: 'https://example.com/avatars/creator2.jpg', // Has avatar
      view_count: 750,
      duration: 200
    },
    {
      id: 'grid-4',
      title: 'System Video',
      url: 'video4.mp4',
      thumbnail_url: 'thumb4.jpg',
      avatar: null, // No avatar
      view_count: 2000,
      duration: 300
    }
  ];

  return (
    <VideoGrid 
      videos={mixedVideos}
      showAvatars={true} // Shows avatars only where available
      onVideoClick={(video) => {
        console.log('Clicked video:', video.title);
        // Handle video click - open in modal, navigate, etc.
      }}
    />
  );
};

// ========== Example 4: Hide All Avatars ==========
export const HideAvatarsExample = () => {
  const video = {
    id: 'demo-5',
    title: 'Anonymous Content',
    url: 'video.mp4',
    avatar: 'https://example.com/avatar.jpg', // Avatar exists in data
  };

  return (
    <VideoPlayer 
      video={video}
      config={{
        showAvatar: false // ⚠️ Hide avatar even if it exists
      }}
    />
  );
};

// ========== Example 5: Different Avatar Positions ==========
export const AvatarPositionsExample = () => {
  const video = {
    id: 'demo-6',
    title: 'Position Demo',
    url: 'video.mp4',
    avatar: 'https://example.com/avatar.jpg',
  };

  return (
    <div>
      {/* Top Left */}
      <VideoPlayer 
        video={video}
        config={{
          showAvatar: true,
          avatarPosition: 'top-left',
          avatarSize: 'small'
        }}
      />

      {/* Top Right (default) */}
      <VideoPlayer 
        video={video}
        config={{
          showAvatar: true,
          avatarPosition: 'top-right',
          avatarSize: 'medium'
        }}
      />

      {/* Bottom Left */}
      <VideoPlayer 
        video={video}
        config={{
          showAvatar: true,
          avatarPosition: 'bottom-left',
          avatarSize: 'large'
        }}
      />

      {/* Bottom Right */}
      <VideoPlayer 
        video={video}
        config={{
          showAvatar: true,
          avatarPosition: 'bottom-right',
          avatarSize: 'medium'
        }}
      />
    </div>
  );
};

// ========== Example 6: API Integration ==========
export const VideoAPIExample = () => {
  const [videos, setVideos] = React.useState([]);

  React.useEffect(() => {
    // Fetch videos from API
    fetch('http://localhost:8080/api/videos')
      .then(res => res.json())
      .then(data => {
        setVideos(data.videos); // Mix of videos with and without avatars
      });
  }, []);

  return (
    <div>
      <h2>All Videos (Mixed Avatars)</h2>
      <VideoGrid 
        videos={videos}
        showAvatars={true}
        onVideoClick={(video) => {
          // Track view
          fetch(`http://localhost:8080/api/videos/${video.id}/view`, {
            method: 'POST'
          });
        }}
      />
    </div>
  );
};

// ========== Example 7: Add/Remove Avatar Dynamically ==========
export const DynamicAvatarExample = () => {
  const [video, setVideo] = React.useState({
    id: 'dynamic-1',
    title: 'Dynamic Avatar Demo',
    url: 'video.mp4',
    avatar: null // Initially no avatar
  });

  const addAvatar = () => {
    // Update video to add avatar
    fetch(`http://localhost:8080/api/videos/${video.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        avatar: 'https://example.com/new-avatar.jpg'
      })
    })
    .then(res => res.json())
    .then(updatedVideo => {
      setVideo(updatedVideo);
    });
  };

  const removeAvatar = () => {
    // Update video to remove avatar
    fetch(`http://localhost:8080/api/videos/${video.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        avatar: null // Explicitly set to null
      })
    })
    .then(res => res.json())
    .then(updatedVideo => {
      setVideo(updatedVideo);
    });
  };

  return (
    <div>
      <VideoPlayer video={video} />
      <div>
        <button onClick={addAvatar}>Add Avatar</button>
        <button onClick={removeAvatar}>Remove Avatar</button>
      </div>
    </div>
  );
};

// ========== Example 8: Create New Video ==========
export const CreateVideoExample = () => {
  const createVideoWithAvatar = async () => {
    const response = await fetch('http://localhost:8080/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Video with Avatar',
        url: 'https://example.com/new-video.mp4',
        avatar: 'https://example.com/avatar.jpg', // ✅ Avatar included
        status: 'published'
      })
    });
    
    const video = await response.json();
    console.log('Created video with avatar:', video);
  };

  const createVideoWithoutAvatar = async () => {
    const response = await fetch('http://localhost:8080/api/videos', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: 'New Video without Avatar',
        url: 'https://example.com/new-video.mp4',
        avatar: null, // ⚠️ Explicitly no avatar
        status: 'published'
      })
    });
    
    const video = await response.json();
    console.log('Created video without avatar:', video);
  };

  return (
    <div>
      <button onClick={createVideoWithAvatar}>
        Create Video WITH Avatar
      </button>
      <button onClick={createVideoWithoutAvatar}>
        Create Video WITHOUT Avatar
      </button>
    </div>
  );
};

export default {
  VideoWithAvatarExample,
  VideoWithoutAvatarExample,
  MixedVideoGridExample,
  HideAvatarsExample,
  AvatarPositionsExample,
  VideoAPIExample,
  DynamicAvatarExample,
  CreateVideoExample
};
