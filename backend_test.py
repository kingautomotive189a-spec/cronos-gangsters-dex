import requests
import sys
import json
from datetime import datetime

class CronosGangstersDEXTester:
    def __init__(self, base_url="https://rebuild-craft.preview.emergentagent.com"):
        self.base_url = base_url
        self.api = f"{base_url}/api"
        self.tests_run = 0
        self.tests_passed = 0
        self.wallet_address = None

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.api}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params)

            success = response.status_code == expected_status
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    return success, response.json()
                except:
                    return success, response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                print(f"Response: {response.text}")

            return success, {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            return False, {}

    def test_root_endpoint(self):
        """Test root API endpoint"""
        return self.run_test("Root API", "GET", "", 200)

    def test_get_tokens(self):
        """Test getting all tokens"""
        success, response = self.run_test("Get All Tokens", "GET", "tokens", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} tokens")
            for token in response[:3]:  # Show first 3 tokens
                print(f"   - {token.get('symbol', 'N/A')}: ${token.get('price_usd', 0)}")
        return success, response

    def test_get_token_by_symbol(self):
        """Test getting specific token"""
        success, response = self.run_test("Get GANG Token", "GET", "tokens/GANG", 200)
        if success:
            print(f"   GANG Price: ${response.get('price_usd', 0)}")
        return success, response

    def test_get_token_prices(self):
        """Test getting token prices"""
        return self.run_test("Get Token Prices", "GET", "token-prices", 200)

    def test_swap_quote(self):
        """Test getting swap quote"""
        success, response = self.run_test(
            "Get Swap Quote", 
            "POST", 
            "swap/quote",
            200,
            params={"from_token": "WCRO", "to_token": "GANG", "amount": 100}
        )
        if success:
            print(f"   Quote: {response.get('from_amount', 0)} WCRO → {response.get('to_amount', 0)} GANG")
            print(f"   Rate: {response.get('rate', 0)}")
            print(f"   Price Impact: {response.get('price_impact', 0)}%")
        return success, response

    def test_execute_swap(self):
        """Test executing a swap"""
        # Generate a test wallet address
        self.wallet_address = '0x' + ''.join(['0123456789abcdef'[i % 16] for i in range(40)])
        
        success, response = self.run_test(
            "Execute Swap",
            "POST",
            "swap/execute",
            200,
            data={
                "from_token": "WCRO",
                "to_token": "GANG", 
                "amount": 10,
                "wallet_address": self.wallet_address,
                "slippage": 0.5
            }
        )
        if success:
            print(f"   Swap ID: {response.get('id', 'N/A')}")
            print(f"   TX Hash: {response.get('tx_hash', 'N/A')}")
        return success, response

    def test_swap_history(self):
        """Test getting swap history"""
        if not self.wallet_address:
            self.wallet_address = '0x' + ''.join(['0123456789abcdef'[i % 16] for i in range(40)])
        
        return self.run_test(
            "Get Swap History",
            "GET", 
            f"swap/history/{self.wallet_address}",
            200
        )

    def test_get_farms(self):
        """Test getting farming pools"""
        success, response = self.run_test("Get Farms", "GET", "farms", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} farming pools")
            for farm in response[:2]:  # Show first 2 farms
                print(f"   - {farm.get('name', 'N/A')}: {farm.get('apr', 0)}% APR")
        return success, response

    def test_farm_deposit(self):
        """Test depositing to farm"""
        if not self.wallet_address:
            self.wallet_address = '0x' + ''.join(['0123456789abcdef'[i % 16] for i in range(40)])
        
        success, response = self.run_test(
            "Farm Deposit",
            "POST",
            "farms/deposit",
            200,
            data={
                "wallet_address": self.wallet_address,
                "pool_id": "gang-cro",
                "amount": 100
            }
        )
        if success:
            print(f"   Position ID: {response.get('id', 'N/A')}")
        return success, response

    def test_farm_positions(self):
        """Test getting farm positions"""
        if not self.wallet_address:
            self.wallet_address = '0x' + ''.join(['0123456789abcdef'[i % 16] for i in range(40)])
        
        return self.run_test(
            "Get Farm Positions",
            "GET",
            f"farms/positions/{self.wallet_address}",
            200
        )

    def test_staking_tiers(self):
        """Test getting staking tiers"""
        success, response = self.run_test("Get Staking Tiers", "GET", "staking/tiers", 200)
        if success and isinstance(response, list):
            print(f"   Found {len(response)} staking tiers")
            for tier in response[:3]:  # Show first 3 tiers
                print(f"   - {tier.get('months', 0)} months: {tier.get('apy', 0)}% APY")
        return success, response

    def test_create_stake(self):
        """Test creating a stake"""
        if not self.wallet_address:
            self.wallet_address = '0x' + ''.join(['0123456789abcdef'[i % 16] for i in range(40)])
        
        success, response = self.run_test(
            "Create Stake",
            "POST",
            "staking/stake",
            200,
            data={
                "wallet_address": self.wallet_address,
                "amount": 1000,
                "lock_months": 12
            }
        )
        if success:
            print(f"   Stake ID: {response.get('id', 'N/A')}")
            print(f"   APY: {response.get('apy', 0)}%")
        return success, response

    def test_stake_positions(self):
        """Test getting stake positions"""
        if not self.wallet_address:
            self.wallet_address = '0x' + ''.join(['0123456789abcdef'[i % 16] for i in range(40)])
        
        return self.run_test(
            "Get Stake Positions",
            "GET",
            f"staking/positions/{self.wallet_address}",
            200
        )

    def test_staking_stats(self):
        """Test getting staking stats"""
        success, response = self.run_test("Get Staking Stats", "GET", "staking/stats", 200)
        if success:
            print(f"   Total Staked: {response.get('total_staked', 0)}")
            print(f"   Total Stakers: {response.get('total_stakers', 0)}")
        return success, response

    def test_wallet_balances(self):
        """Test getting wallet balances"""
        if not self.wallet_address:
            self.wallet_address = '0x' + ''.join(['0123456789abcdef'[i % 16] for i in range(40)])
        
        success, response = self.run_test(
            "Get Wallet Balances",
            "GET",
            f"wallet/balances/{self.wallet_address}",
            200
        )
        if success and isinstance(response, list):
            print(f"   Found {len(response)} token balances")
            for balance in response[:3]:  # Show first 3 balances
                print(f"   - {balance.get('token', 'N/A')}: {balance.get('balance', 0)}")
        return success, response

    def test_update_wallet_balance(self):
        """Test updating wallet balance"""
        if not self.wallet_address:
            self.wallet_address = '0x' + ''.join(['0123456789abcdef'[i % 16] for i in range(40)])
        
        return self.run_test(
            "Update Wallet Balance",
            "POST",
            "wallet/update-balance",
            200,
            params={
                "wallet_address": self.wallet_address,
                "token": "GANG",
                "amount": 50000
            }
        )

    def test_dex_stats(self):
        """Test getting DEX stats"""
        success, response = self.run_test("Get DEX Stats", "GET", "dex/stats", 200)
        if success:
            print(f"   Total Transactions: {response.get('total_transactions', 0)}")
            print(f"   24h Volume: ${response.get('volume_24h', 0)}")
            print(f"   Total TVL: ${response.get('total_tvl', 0)}")
        return success, response

    def test_price_history(self):
        """Test getting price history"""
        return self.run_test(
            "Get Price History",
            "GET",
            "price-history/GANG",
            200,
            params={"timeframe": "24h"}
        )

def main():
    print("🚀 Starting Cronos Gangsters DEX API Tests")
    print("=" * 50)
    
    tester = CronosGangstersDEXTester()
    
    # Test all endpoints
    test_methods = [
        tester.test_root_endpoint,
        tester.test_get_tokens,
        tester.test_get_token_by_symbol,
        tester.test_get_token_prices,
        tester.test_swap_quote,
        tester.test_execute_swap,
        tester.test_swap_history,
        tester.test_get_farms,
        tester.test_farm_deposit,
        tester.test_farm_positions,
        tester.test_staking_tiers,
        tester.test_create_stake,
        tester.test_stake_positions,
        tester.test_staking_stats,
        tester.test_wallet_balances,
        tester.test_update_wallet_balance,
        tester.test_dex_stats,
        tester.test_price_history
    ]
    
    for test_method in test_methods:
        try:
            test_method()
        except Exception as e:
            print(f"❌ Test failed with exception: {str(e)}")
    
    # Print results
    print("\n" + "=" * 50)
    print(f"📊 Test Results: {tester.tests_passed}/{tester.tests_run} passed")
    
    if tester.tests_passed == tester.tests_run:
        print("🎉 All tests passed!")
        return 0
    else:
        print(f"⚠️  {tester.tests_run - tester.tests_passed} tests failed")
        return 1

if __name__ == "__main__":
    sys.exit(main())