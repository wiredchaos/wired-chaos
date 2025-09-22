import requests
import sys
import json
from datetime import datetime

class WiredChaosBotBrainTester:
    def __init__(self, base_url="https://wired-chaos-hub.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.failed_tests = []

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None, validate_response=None):
        """Run a single API test"""
        url = f"{self.api_url}{endpoint}" if endpoint else self.api_url
        if headers is None:
            headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        if data:
            print(f"   Data: {json.dumps(data, indent=2)}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=10)

            print(f"   Status Code: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = {}
            
            if success:
                try:
                    response_data = response.json()
                    print(f"   Response: {json.dumps(response_data, indent=2)}")
                    
                    # Additional response validation if provided
                    if validate_response and not validate_response(response_data):
                        success = False
                        print(f"❌ FAILED - {name} - Response validation failed")
                        self.failed_tests.append({
                            'name': name,
                            'error': 'Response validation failed',
                            'response': json.dumps(response_data)
                        })
                    else:
                        self.tests_passed += 1
                        print(f"✅ PASSED - {name}")
                        
                except json.JSONDecodeError:
                    print(f"   Response (text): {response.text[:200]}...")
                    if response.text:
                        self.tests_passed += 1
                        print(f"✅ PASSED - {name}")
                    else:
                        success = False
                        print(f"❌ FAILED - {name} - Empty response")
                        self.failed_tests.append({
                            'name': name,
                            'error': 'Empty response',
                            'response': response.text
                        })
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

            return success, response_data

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

    def test_api_health(self):
        """Test basic API health - GET /api"""
        # Note: The server.py doesn't have a root GET endpoint defined
        # This test will likely fail with 405 Method Not Allowed
        return self.run_test("API Health Check", "GET", "", 200)

    def test_ai_routing(self):
        """Test AI routing endpoint - POST /api/route"""
        test_cases = [
            {
                "text": "I want to learn about crypto",
                "expected_section": "csn",
                "description": "Crypto routing to CSN"
            },
            {
                "text": "show me the news", 
                "expected_section": "bwb",
                "description": "News routing to BWB"
            },
            {
                "text": "I need help with Web3",
                "expected_section": "neuro", 
                "description": "Web3 routing to NEURO"
            },
            {
                "text": "random text that doesn't match",
                "expected_section": "hub",
                "description": "Default routing to hub"
            }
        ]
        
        all_passed = True
        for case in test_cases:
            data = {"text": case["text"]}
            
            def validate_routing(response):
                return "section" in response and response["section"] == case["expected_section"]
            
            success, response = self.run_test(
                f"AI Routing - {case['description']}", 
                "POST", 
                "/route", 
                200, 
                data=data,
                validate_response=validate_routing
            )
            
            if not success:
                all_passed = False
                
        return all_passed

    def test_ai_ask(self):
        """Test AI ask endpoint - POST /api/ask"""
        test_data = {
            "message": "What is WIRED CHAOS?",
            "section": "hub"
        }
        
        def validate_ask_response(response):
            return "reply" in response and "section" in response and response["section"] == "hub"
        
        success, response = self.run_test(
            "AI Ask Endpoint", 
            "POST", 
            "/ask", 
            200, 
            data=test_data,
            validate_response=validate_ask_response
        )
        
        # Check if response contains [DEV STUB] since OPENAI_API_KEY is placeholder
        if success and response and "reply" in response:
            if "[DEV STUB]" in response["reply"]:
                print("   ✅ Correctly returning DEV STUB response (OPENAI_API_KEY is placeholder)")
            else:
                print("   ⚠️  Expected DEV STUB response but got actual AI response")
        
        return success

    def test_rss_summarization(self):
        """Test RSS summarization endpoint - POST /api/rss/summarize"""
        # Using a simple RSS feed URL for testing
        test_data = {
            "url": "https://feeds.feedburner.com/TechCrunch",
            "max_items": 3
        }
        
        def validate_rss_response(response):
            required_fields = ["summary", "count", "generated_at"]
            return all(field in response for field in required_fields)
        
        success, response = self.run_test(
            "RSS Summarization", 
            "POST", 
            "/rss/summarize", 
            200, 
            data=test_data,
            validate_response=validate_rss_response
        )
        
        # Check if response contains [DEV STUB] since OPENAI_API_KEY is placeholder
        if success and response and "summary" in response:
            if "[DEV STUB]" in response["summary"]:
                print("   ✅ Correctly returning DEV STUB response (OPENAI_API_KEY is placeholder)")
            else:
                print("   ⚠️  Expected DEV STUB response but got actual AI response")
        
        return success

    def run_all_tests(self):
        """Run all WIRED CHAOS Bot Brain API tests"""
        print("🚀 Starting WIRED CHAOS Bot Brain API Tests...")
        print(f"🌐 Testing against: {self.base_url}")
        print("=" * 60)

        # Test all new endpoints
        self.test_api_health()
        self.test_ai_routing()
        self.test_ai_ask()
        self.test_rss_summarization()

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
    tester = WiredChaosBotBrainTester()
    success = tester.run_all_tests()
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())