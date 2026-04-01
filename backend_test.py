import requests
import sys
import time
from datetime import datetime

class TelegramBotAPITester:
    def __init__(self, base_url="https://tg-all-in-one.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response: {str(response_data)[:200]}...")
                except:
                    print(f"   Response: {response.text[:200]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"   Response: {response.text[:200]}...")

            self.test_results.append({
                "name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_preview": response.text[:200] if not success else "OK"
            })

            return success, response.json() if success and response.text else {}

        except requests.exceptions.Timeout:
            print(f"❌ Failed - Timeout after {timeout}s")
            self.test_results.append({
                "name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": "TIMEOUT",
                "success": False,
                "response_preview": f"Timeout after {timeout}s"
            })
            return False, {}
        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "response_preview": str(e)
            })
            return False, {}

    def test_token_price(self):
        """Test token price API"""
        success, response = self.run_test(
            "Token Price API",
            "GET",
            "token/price",
            200
        )
        
        if success:
            # Validate response structure
            if 'success' in response and response.get('success'):
                data = response.get('data', {})
                required_fields = ['price_usd', 'change_h24', 'volume_h24']
                missing_fields = [field for field in required_fields if field not in data]
                if missing_fields:
                    print(f"⚠️  Warning: Missing fields in response: {missing_fields}")
                else:
                    print(f"✅ Price data structure is valid")
                    print(f"   Price USD: {data.get('price_usd')}")
                    print(f"   24h Change: {data.get('change_h24')}")
                    print(f"   24h Volume: {data.get('volume_h24')}")
            else:
                print(f"⚠️  Warning: API returned success=false or missing success field")
        
        return success

    def test_bot_config(self):
        """Test bot configuration API"""
        success, response = self.run_test(
            "Bot Config API",
            "GET",
            "bot/config",
            200
        )
        
        if success:
            required_fields = ['contract', 'group_id', 'dex_link', 'twitter', 'telegram_group']
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Warning: Missing config fields: {missing_fields}")
            else:
                print(f"✅ Bot config structure is valid")
                print(f"   Contract: {response.get('contract')}")
                print(f"   Group ID: {response.get('group_id')}")
        
        return success

    def test_bot_status(self):
        """Test bot status API"""
        success, response = self.run_test(
            "Bot Status API",
            "GET",
            "bot/status",
            200
        )
        
        if success:
            if 'running' in response:
                print(f"✅ Bot status: {'Running' if response['running'] else 'Stopped'}")
                if response.get('pid'):
                    print(f"   PID: {response['pid']}")
            else:
                print(f"⚠️  Warning: Missing 'running' field in status response")
        
        return success, response

    def test_bot_commands(self):
        """Test bot commands API"""
        success, response = self.run_test(
            "Bot Commands API",
            "GET",
            "bot/commands",
            200
        )
        
        if success:
            commands = response.get('commands', [])
            admin_commands = response.get('admin_commands', [])
            
            print(f"✅ Found {len(commands)} general commands and {len(admin_commands)} admin commands")
            
            # Check for expected commands
            expected_commands = ['/start', '/help', '/price', '/stats', '/contract', '/buy', '/website', '/socials', '/shill', '/alert']
            found_commands = [cmd.get('command') for cmd in commands]
            missing_commands = [cmd for cmd in expected_commands if cmd not in found_commands]
            
            if missing_commands:
                print(f"⚠️  Warning: Missing expected commands: {missing_commands}")
            else:
                print(f"✅ All expected general commands are present")
            
            # Check admin commands
            expected_admin = ['/ban', '/unban', '/mute', '/unmute', '/kick', '/warn']
            found_admin = [cmd.get('command') for cmd in admin_commands]
            missing_admin = [cmd for cmd in expected_admin if cmd not in found_admin]
            
            if missing_admin:
                print(f"⚠️  Warning: Missing expected admin commands: {missing_admin}")
            else:
                print(f"✅ All expected admin commands are present")
        
        return success

    def test_bot_start(self):
        """Test bot start API"""
        success, response = self.run_test(
            "Bot Start API",
            "POST",
            "bot/start",
            200
        )
        
        if success:
            if response.get('success'):
                print(f"✅ Bot start successful: {response.get('message')}")
                if response.get('pid'):
                    print(f"   Bot PID: {response['pid']}")
            else:
                print(f"⚠️  Bot start returned success=false: {response.get('message')}")
        
        return success, response

    def test_bot_stop(self):
        """Test bot stop API"""
        success, response = self.run_test(
            "Bot Stop API",
            "POST",
            "bot/stop",
            200
        )
        
        if success:
            if response.get('success'):
                print(f"✅ Bot stop successful: {response.get('message')}")
            else:
                print(f"⚠️  Bot stop returned success=false: {response.get('message')}")
        
        return success, response

    def test_health_check(self):
        """Test basic health check"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "",
            200
        )
        return success

def main():
    print("🚀 Starting Cronos Gangsters Telegram Bot API Tests")
    print("=" * 60)
    
    tester = TelegramBotAPITester()
    
    # Test sequence
    print("\n📋 Running API Tests...")
    
    # 1. Health check
    tester.test_health_check()
    
    # 2. Token price API
    tester.test_token_price()
    
    # 3. Bot configuration
    tester.test_bot_config()
    
    # 4. Bot status (before any actions)
    initial_status_success, initial_status = tester.test_bot_status()
    
    # 5. Bot commands
    tester.test_bot_commands()
    
    # 6. Bot management tests
    print("\n🤖 Testing Bot Management...")
    
    # Check initial bot status
    bot_was_running = initial_status.get('running', False) if initial_status_success else False
    
    if bot_was_running:
        print("ℹ️  Bot is currently running, testing stop first...")
        stop_success, stop_response = tester.test_bot_stop()
        time.sleep(2)  # Wait for stop to complete
    
    # Test start
    start_success, start_response = tester.test_bot_start()
    if start_success:
        time.sleep(3)  # Give bot time to start
        
        # Verify it's running
        status_success, status_response = tester.test_bot_status()
        if status_success and status_response.get('running'):
            print("✅ Bot start verification successful")
        else:
            print("⚠️  Bot may not have started properly")
    
    # Test stop
    stop_success, stop_response = tester.test_bot_stop()
    if stop_success:
        time.sleep(2)  # Give bot time to stop
        
        # Verify it's stopped
        status_success, status_response = tester.test_bot_status()
        if status_success and not status_response.get('running'):
            print("✅ Bot stop verification successful")
        else:
            print("⚠️  Bot may not have stopped properly")
    
    # Restore original state
    if bot_was_running:
        print("ℹ️  Restoring bot to running state...")
        tester.test_bot_start()
    
    # Print final results
    print("\n" + "=" * 60)
    print("📊 TEST RESULTS SUMMARY")
    print("=" * 60)
    print(f"Total Tests: {tester.tests_run}")
    print(f"Passed: {tester.tests_passed}")
    print(f"Failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success Rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Print failed tests
    failed_tests = [test for test in tester.test_results if not test['success']]
    if failed_tests:
        print(f"\n❌ FAILED TESTS ({len(failed_tests)}):")
        for test in failed_tests:
            print(f"   • {test['name']}: {test['actual_status']} - {test['response_preview']}")
    else:
        print(f"\n✅ ALL TESTS PASSED!")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())