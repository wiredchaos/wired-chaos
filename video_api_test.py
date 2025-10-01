"""
WIRED CHAOS - Video API Tests
Tests for video endpoints with optional avatar linking
"""

import requests
import json

class VideoAPITester:
    def __init__(self, base_url="http://localhost:8080"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []
        self.created_video_ids = []

    def run_test(self, name, method, endpoint, expected_status, data=None, validate_response=None):
        """Run a single API test"""
        self.tests_run += 1
        url = f"{self.api_url}{endpoint}"
        
        try:
            if method == "GET":
                response = requests.get(url, timeout=10)
            elif method == "POST":
                response = requests.post(url, json=data, timeout=10)
            elif method == "PUT":
                response = requests.put(url, json=data, timeout=10)
            elif method == "DELETE":
                response = requests.delete(url, timeout=10)
            else:
                print(f"❌ {name}: Invalid method {method}")
                self.failed_tests.append(name)
                return False, None

            if response.status_code != expected_status:
                print(f"❌ {name}: Expected status {expected_status}, got {response.status_code}")
                self.failed_tests.append(name)
                return False, None

            response_data = response.json() if response.text else {}

            if validate_response and not validate_response(response_data):
                print(f"❌ {name}: Response validation failed")
                self.failed_tests.append(name)
                return False, response_data

            print(f"✅ {name}")
            self.tests_passed += 1
            return True, response_data

        except Exception as e:
            print(f"❌ {name}: {str(e)}")
            self.failed_tests.append(name)
            return False, None

    def test_create_video_with_avatar(self):
        """Test creating a video WITH an avatar"""
        data = {
            "title": "Test Video with Avatar",
            "description": "This video has an avatar",
            "url": "https://example.com/video1.mp4",
            "thumbnail_url": "https://example.com/thumb1.jpg",
            "duration": 120,
            "avatar": "https://example.com/avatar1.jpg",
            "tags": ["test", "avatar"],
            "status": "published"
        }

        def validate(response):
            is_valid = (
                "id" in response and
                response["title"] == data["title"] and
                response["avatar"] == data["avatar"] and
                response["url"] == data["url"]
            )
            if is_valid and "id" in response:
                self.created_video_ids.append(response["id"])
            return is_valid

        return self.run_test(
            "Create Video WITH Avatar",
            "POST",
            "/videos",
            200,
            data=data,
            validate_response=validate
        )

    def test_create_video_without_avatar(self):
        """Test creating a video WITHOUT an avatar (avatar = null)"""
        data = {
            "title": "Test Video without Avatar",
            "description": "This video has no avatar",
            "url": "https://example.com/video2.mp4",
            "thumbnail_url": "https://example.com/thumb2.jpg",
            "duration": 180,
            "avatar": None,  # Explicitly null
            "tags": ["test", "no-avatar"],
            "status": "published"
        }

        def validate(response):
            is_valid = (
                "id" in response and
                response["title"] == data["title"] and
                response["avatar"] is None and
                response["url"] == data["url"]
            )
            if is_valid and "id" in response:
                self.created_video_ids.append(response["id"])
            return is_valid

        return self.run_test(
            "Create Video WITHOUT Avatar (null)",
            "POST",
            "/videos",
            200,
            data=data,
            validate_response=validate
        )

    def test_create_video_avatar_omitted(self):
        """Test creating a video with avatar field omitted entirely"""
        data = {
            "title": "Test Video Avatar Omitted",
            "url": "https://example.com/video3.mp4",
            "status": "draft"
            # Note: avatar field not included at all
        }

        def validate(response):
            is_valid = (
                "id" in response and
                response["title"] == data["title"] and
                ("avatar" not in response or response["avatar"] is None)
            )
            if is_valid and "id" in response:
                self.created_video_ids.append(response["id"])
            return is_valid

        return self.run_test(
            "Create Video with Avatar Field Omitted",
            "POST",
            "/videos",
            200,
            data=data,
            validate_response=validate
        )

    def test_list_videos_mixed_avatars(self):
        """Test listing videos (should include both with and without avatars)"""
        def validate(response):
            return (
                "videos" in response and
                isinstance(response["videos"], list) and
                "total" in response
            )

        return self.run_test(
            "List Videos (mixed avatars)",
            "GET",
            "/videos",
            200,
            validate_response=validate
        )

    def test_update_video_add_avatar(self):
        """Test adding an avatar to a video that doesn't have one"""
        if not self.created_video_ids:
            print("⚠️ Update Video - Add Avatar: No videos created yet, skipping")
            return False, None

        video_id = self.created_video_ids[0]
        data = {
            "avatar": "https://example.com/new-avatar.jpg"
        }

        def validate(response):
            return (
                "id" in response and
                response["id"] == video_id and
                response["avatar"] == data["avatar"]
            )

        return self.run_test(
            "Update Video - Add Avatar",
            "PUT",
            f"/videos/{video_id}",
            200,
            data=data,
            validate_response=validate
        )

    def test_update_video_remove_avatar(self):
        """Test removing an avatar from a video"""
        if not self.created_video_ids:
            print("⚠️ Update Video - Remove Avatar: No videos created yet, skipping")
            return False, None

        video_id = self.created_video_ids[0]
        data = {
            "avatar": None  # Explicitly set to null
        }

        def validate(response):
            return (
                "id" in response and
                response["id"] == video_id and
                response["avatar"] is None
            )

        return self.run_test(
            "Update Video - Remove Avatar",
            "PUT",
            f"/videos/{video_id}",
            200,
            data=data,
            validate_response=validate
        )

    def test_get_video_with_avatar(self):
        """Test retrieving a specific video with avatar"""
        if len(self.created_video_ids) < 1:
            print("⚠️ Get Video with Avatar: No videos created yet, skipping")
            return False, None

        video_id = self.created_video_ids[0]

        def validate(response):
            return (
                "id" in response and
                response["id"] == video_id and
                "avatar" in response  # Avatar field should be present
            )

        return self.run_test(
            "Get Video with Avatar",
            "GET",
            f"/videos/{video_id}",
            200,
            validate_response=validate
        )

    def test_get_video_without_avatar(self):
        """Test retrieving a specific video without avatar"""
        if len(self.created_video_ids) < 2:
            print("⚠️ Get Video without Avatar: Need at least 2 videos, skipping")
            return False, None

        video_id = self.created_video_ids[1]

        def validate(response):
            return (
                "id" in response and
                response["id"] == video_id and
                ("avatar" not in response or response["avatar"] is None)
            )

        return self.run_test(
            "Get Video without Avatar",
            "GET",
            f"/videos/{video_id}",
            200,
            validate_response=validate
        )

    def test_video_view_count(self):
        """Test incrementing view count (should work with or without avatar)"""
        if not self.created_video_ids:
            print("⚠️ Video View Count: No videos created yet, skipping")
            return False, None

        video_id = self.created_video_ids[0]

        def validate(response):
            return "view_count" in response and response["view_count"] > 0

        return self.run_test(
            "Increment Video View Count",
            "POST",
            f"/videos/{video_id}/view",
            200,
            validate_response=validate
        )

    def cleanup_test_videos(self):
        """Clean up test videos"""
        print("\n🧹 Cleaning up test videos...")
        for video_id in self.created_video_ids:
            try:
                requests.delete(f"{self.api_url}/videos/{video_id}", timeout=10)
                print(f"  ✅ Deleted video {video_id}")
            except Exception as e:
                print(f"  ⚠️ Failed to delete video {video_id}: {e}")

    def run_all_tests(self):
        """Run all video API tests"""
        print("=" * 60)
        print("🎬 WIRED CHAOS - Video API Tests (Optional Avatar Linking)")
        print("=" * 60)

        # Test video creation scenarios
        self.test_create_video_with_avatar()
        self.test_create_video_without_avatar()
        self.test_create_video_avatar_omitted()

        # Test listing
        self.test_list_videos_mixed_avatars()

        # Test retrieving specific videos
        self.test_get_video_with_avatar()
        self.test_get_video_without_avatar()

        # Test updates
        self.test_update_video_add_avatar()
        self.test_update_video_remove_avatar()

        # Test view count
        self.test_video_view_count()

        # Cleanup
        self.cleanup_test_videos()

        # Summary
        print("\n" + "=" * 60)
        print(f"Tests Run: {self.tests_run}")
        print(f"Tests Passed: {self.tests_passed}")
        print(f"Tests Failed: {self.tests_run - self.tests_passed}")

        if self.failed_tests:
            print("\nFailed Tests:")
            for test in self.failed_tests:
                print(f"  ❌ {test}")
        else:
            print("\n🎉 All tests passed!")

        print("=" * 60)

        return self.tests_passed == self.tests_run


def main():
    """Run video API tests"""
    tester = VideoAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1


if __name__ == "__main__":
    exit(main())
