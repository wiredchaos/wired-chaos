"""
Test suite for Video API with optional avatar linking

Tests ensure that:
1. Videos can be created without avatars
2. Videos can be created with avatars
3. Avatars can be added/removed via updates
4. Filtering by avatar presence works correctly
5. UI gracefully handles both states
"""

import pytest
import sys
import os

# Add backend to path
sys.path.insert(0, os.path.join(os.path.dirname(__file__), 'backend'))

from fastapi.testclient import TestClient
from server import app

client = TestClient(app)


class TestVideoAvatarOptional:
    """Test suite for optional avatar linking in videos"""
    
    def test_create_video_without_avatar(self):
        """Test creating a video without an avatar - should succeed"""
        video_data = {
            "title": "Test Video Without Avatar",
            "description": "This video has no avatar",
            "video_url": "https://example.com/video1.mp4",
            "thumbnail_url": "https://example.com/thumb1.jpg",
            "avatar_url": None,  # Explicitly no avatar
            "duration": 300,
            "tags": ["test", "no-avatar"]
        }
        
        response = client.post("/api/videos", json=video_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Video Without Avatar"
        assert data["avatar_url"] is None
        assert "id" in data
        
        print("✅ Video created without avatar successfully")
    
    def test_create_video_with_avatar(self):
        """Test creating a video with an avatar"""
        video_data = {
            "title": "Test Video With Avatar",
            "description": "This video has an avatar",
            "video_url": "https://example.com/video2.mp4",
            "thumbnail_url": "https://example.com/thumb2.jpg",
            "avatar_url": "https://example.com/avatar.jpg",  # Avatar provided
            "duration": 240,
            "tags": ["test", "with-avatar"]
        }
        
        response = client.post("/api/videos", json=video_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Test Video With Avatar"
        assert data["avatar_url"] == "https://example.com/avatar.jpg"
        assert "id" in data
        
        print("✅ Video created with avatar successfully")
    
    def test_create_video_avatar_omitted(self):
        """Test creating a video with avatar field omitted entirely"""
        video_data = {
            "title": "Test Video Avatar Omitted",
            "video_url": "https://example.com/video3.mp4",
            # avatar_url is not included at all
            "tags": ["test"]
        }
        
        response = client.post("/api/videos", json=video_data)
        
        assert response.status_code == 200
        data = response.json()
        assert data["avatar_url"] is None  # Should default to None
        
        print("✅ Video created with avatar field omitted successfully")
    
    def test_list_all_videos(self):
        """Test listing all videos (with and without avatars)"""
        response = client.get("/api/videos")
        
        assert response.status_code == 200
        data = response.json()
        assert "videos" in data
        assert "count" in data
        assert isinstance(data["videos"], list)
        
        print(f"✅ Listed {data['count']} total videos")
    
    def test_filter_videos_with_avatars(self):
        """Test filtering to show only videos with avatars"""
        response = client.get("/api/videos?has_avatar=true")
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned videos should have avatars
        for video in data["videos"]:
            assert video.get("avatar_url") is not None
        
        print(f"✅ Filtered {len(data['videos'])} videos with avatars")
    
    def test_filter_videos_without_avatars(self):
        """Test filtering to show only videos without avatars"""
        response = client.get("/api/videos?has_avatar=false")
        
        assert response.status_code == 200
        data = response.json()
        
        # All returned videos should NOT have avatars
        for video in data["videos"]:
            assert video.get("avatar_url") is None
        
        print(f"✅ Filtered {len(data['videos'])} videos without avatars")
    
    def test_update_video_add_avatar(self):
        """Test adding an avatar to a video that doesn't have one"""
        # First create a video without avatar
        video_data = {
            "title": "Video to Update",
            "video_url": "https://example.com/video4.mp4",
            "avatar_url": None
        }
        
        create_response = client.post("/api/videos", json=video_data)
        video_id = create_response.json()["id"]
        
        # Now add an avatar
        update_data = {
            "avatar_url": "https://example.com/new-avatar.jpg"
        }
        
        update_response = client.put(f"/api/videos/{video_id}", json=update_data)
        
        assert update_response.status_code == 200
        updated_video = update_response.json()["video"]
        assert updated_video["avatar_url"] == "https://example.com/new-avatar.jpg"
        
        print("✅ Avatar added to video successfully")
    
    def test_update_video_remove_avatar(self):
        """Test removing an avatar from a video that has one"""
        # First create a video with avatar
        video_data = {
            "title": "Video to Remove Avatar",
            "video_url": "https://example.com/video5.mp4",
            "avatar_url": "https://example.com/avatar-to-remove.jpg"
        }
        
        create_response = client.post("/api/videos", json=video_data)
        video_id = create_response.json()["id"]
        
        # Now remove the avatar
        update_data = {
            "avatar_url": None
        }
        
        update_response = client.put(f"/api/videos/{video_id}", json=update_data)
        
        assert update_response.status_code == 200
        updated_video = update_response.json()["video"]
        assert updated_video["avatar_url"] is None
        
        print("✅ Avatar removed from video successfully")
    
    def test_video_stats(self):
        """Test video statistics showing avatar usage"""
        response = client.get("/api/videos/stats/summary")
        
        assert response.status_code == 200
        data = response.json()
        
        assert "total_videos" in data
        assert "videos_with_avatars" in data
        assert "videos_without_avatars" in data
        assert "avatar_usage_percentage" in data
        
        # Verify math
        total = data["total_videos"]
        with_avatars = data["videos_with_avatars"]
        without_avatars = data["videos_without_avatars"]
        
        assert total == with_avatars + without_avatars
        
        print(f"✅ Stats: {with_avatars} with avatars, {without_avatars} without")
    
    def test_get_single_video_with_avatar_flag(self):
        """Test that get single video returns has_avatar flag"""
        # Create a video
        video_data = {
            "title": "Single Video Test",
            "video_url": "https://example.com/video6.mp4",
            "avatar_url": "https://example.com/avatar6.jpg"
        }
        
        create_response = client.post("/api/videos", json=video_data)
        video_id = create_response.json()["id"]
        
        # Get the video
        get_response = client.get(f"/api/videos/{video_id}")
        
        assert get_response.status_code == 200
        data = get_response.json()
        
        assert "video" in data
        assert "has_avatar" in data
        assert data["has_avatar"] is True
        
        print("✅ Single video retrieved with has_avatar flag")


if __name__ == "__main__":
    print("\n" + "="*60)
    print("WIRED CHAOS - Video Avatar Optional Testing")
    print("="*60 + "\n")
    
    # Run tests
    pytest.main([__file__, "-v", "--tb=short"])
