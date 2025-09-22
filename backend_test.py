import requests
import sys
import json
from datetime import datetime

class WiredChaosAPITester:
    def __init__(self, base_url="https://wired-chaos-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}" if endpoint else f"{self.api_url}/"
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ PASSED - {name}")
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ FAILED - {name}")
                print(f"   Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:300]}")
                self.failed_tests.append({
                    'name': name,
                    'expected': expected_status,
                    'actual': response.status_code,
                    'response': response.text[:300]
                })

            return success, response.json() if success and response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ FAILED - {name} - Request timed out")
            self.failed_tests.append({'name': name, 'error': 'Timeout'})
            return False, {}
        except requests.exceptions.ConnectionError:
            print(f"❌ FAILED - {name} - Connection error")
            self.failed_tests.append({'name': name, 'error': 'Connection error'})
            return False, {}
        except Exception as e:
            print(f"❌ FAILED - {name} - Error: {str(e)}")
            self.failed_tests.append({'name': name, 'error': str(e)})
            return False, {}

    def test_root_endpoint(self):
        """Test the root API endpoint"""
        return self.run_test("Root API Endpoint", "GET", "", 200)

    def test_status_endpoints(self):
        """Test status check endpoints"""
        # Test GET status
        success1, _ = self.run_test("Get Status Checks", "GET", "status", 200)
        
        # Test POST status
        test_data = {"client_name": f"test_client_{datetime.now().strftime('%H%M%S')}"}
        success2, response = self.run_test("Create Status Check", "POST", "status", 200, data=test_data)
        
        return success1 and success2

    def test_referral_endpoints(self):
        """Test referral system endpoints"""
        # Test submit referral
        referral_data = {
            "name": f"Test User {datetime.now().strftime('%H%M%S')}",
            "email": f"test{datetime.now().strftime('%H%M%S')}@example.com",
            "service_interest": "ai-training",
            "source_agent": "neuro_lab"
        }
        
        success1, response = self.run_test("Submit Referral Lead", "POST", "referral/submit", 200, data=referral_data)
        
        # Test get all referrals
        success2, _ = self.run_test("Get Referral Leads", "GET", "referral/leads", 200)
        
        # Test get specific referral if we got an ID
        success3 = True
        if success1 and response and 'id' in response:
            lead_id = response['id']
            success3, _ = self.run_test("Get Specific Referral Lead", "GET", f"referral/leads/{lead_id}", 200)
        
        return success1 and success2 and success3

    def test_agent_endpoints(self):
        """Test agent metrics and tracking endpoints"""
        # Test track agent visit
        agent_name = "neuro_lab"
        success1, _ = self.run_test("Track Agent Visit", "POST", f"agent/visit/{agent_name}", 200)
        
        # Test get all agent metrics
        success2, _ = self.run_test("Get All Agent Metrics", "GET", "agent/metrics", 200)
        
        # Test get specific agent metrics
        success3, _ = self.run_test("Get Specific Agent Metrics", "GET", f"agent/metrics/{agent_name}", 200)
        
        return success1 and success2 and success3

    def test_rss_endpoint(self):
        """Test RSS feeds endpoint"""
        return self.run_test("Get RSS Feeds", "GET", "rss/feeds", 200)[0]

    def test_stream_endpoint(self):
        """Test streaming status endpoint"""
        return self.run_test("Get Stream Status", "GET", "stream/status", 200)[0]

    def run_all_tests(self):
        """Run all API tests"""
        print("🚀 Starting WIRED CHAOS API Tests...")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)

        # Test all endpoints
        self.test_root_endpoint()
        self.test_status_endpoints()
        self.test_referral_endpoints()
        self.test_agent_endpoints()
        self.test_rss_endpoint()
        self.test_stream_endpoint()

        # Print final results
        print("\n" + "=" * 60)
        print("📊 FINAL TEST RESULTS")
        print("=" * 60)
        print(f"✅ Tests Passed: {self.tests_passed}/{self.tests_run}")
        print(f"❌ Tests Failed: {len(self.failed_tests)}/{self.tests_run}")
        
        if self.failed_tests:
            print("\n🔥 FAILED TESTS DETAILS:")
            for i, test in enumerate(self.failed_tests, 1):
                print(f"\n{i}. {test['name']}")
                if 'expected' in test:
                    print(f"   Expected: {test['expected']}, Got: {test['actual']}")
                    print(f"   Response: {test['response']}")
                else:
                    print(f"   Error: {test['error']}")
        
        success_rate = (self.tests_passed / self.tests_run) * 100 if self.tests_run > 0 else 0
        print(f"\n🎯 Success Rate: {success_rate:.1f}%")
        
        return self.tests_passed == self.tests_run

def main():
    tester = WiredChaosAPITester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())