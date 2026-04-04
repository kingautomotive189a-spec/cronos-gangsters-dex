from fastapi import FastAPI, APIRouter, BackgroundTasks
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
import aiohttp
import asyncio
import subprocess
import signal
import sys
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional, Dict, Any
import uuid
from datetime import datetime, timezone


ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# Configure logging early (before it's used)
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# Import mining and trading routers
from mining_api import router as mining_router
from trading_api import router as trading_router

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Bot configuration from env
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CONTRACT = os.environ.get("CONTRACT_ADDRESS", "0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF")
GROUP_ID = os.environ.get("GROUP_ID", "-1003284963991")
DEXSCREENER_API = f"https://api.dexscreener.com/latest/dex/tokens/{CONTRACT}"

# Bot process management
bot_process = None

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")


# Define Models
class StatusCheck(BaseModel):
    model_config = ConfigDict(extra="ignore")  # Ignore MongoDB's _id field
    
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    client_name: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

class StatusCheckCreate(BaseModel):
    client_name: str

class BotConfig(BaseModel):
    token: str
    contract: str
    group_id: str
    dex_link: str
    twitter: str
    telegram_group: str
    price_update_interval: int

class TokenData(BaseModel):
    price_usd: Optional[str] = None
    price_native: Optional[str] = None
    change_h1: Optional[str] = None
    change_h6: Optional[str] = None
    change_h24: Optional[str] = None
    volume_h24: Optional[str] = None
    liquidity: Optional[str] = None
    market_cap: Optional[str] = None
    buys_h24: Optional[int] = None
    sells_h24: Optional[int] = None
    dex_id: Optional[str] = None
    pair_created_at: Optional[int] = None

# Add your routes to the router instead of directly to app
@api_router.get("/")
async def root():
    return {"message": "Hello World"}

@api_router.get("/prices")
async def get_token_prices():
    """Proxy for CoinGecko prices to avoid CORS on frontend"""
    cg_ids = "crypto-com-chain,dogecoin,shiba-inu,cosmos,ripple,pepe,ethereum,bitcoin,vvs-finance"
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(
                f"https://api.coingecko.com/api/v3/simple/price?ids={cg_ids}&vs_currencies=usd",
                timeout=aiohttp.ClientTimeout(total=10)
            ) as resp:
                if resp.status == 200:
                    data = await resp.json()
                    # Map CoinGecko IDs to token symbols
                    mapping = {
                        "crypto-com-chain": "CRO",
                        "dogecoin": "DOGE",
                        "shiba-inu": "SHIB",
                        "cosmos": "ATOM",
                        "ripple": "XRP",
                        "pepe": "PEPE",
                        "ethereum": "WETH",
                        "bitcoin": "WBTC",
                        "vvs-finance": "VVS"
                    }
                    prices = {}
                    for cg_id, symbol in mapping.items():
                        if cg_id in data and "usd" in data[cg_id]:
                            prices[symbol] = data[cg_id]["usd"]
                    return {"prices": prices}
    except Exception as e:
        logging.error(f"CoinGecko price fetch failed: {e}")
    # Fallback prices
    return {"prices": {"CRO": 0.095, "DOGE": 0.18, "SHIB": 0.000014, "ATOM": 7.5, "XRP": 2.2, "PEPE": 0.000012, "WETH": 3800, "WBTC": 90000, "VVS": 0.0000025}}

@api_router.get("/contract-code")
async def get_contract_code():
    """Return the smart contract code as plain text"""
    code = """// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

interface IERC20 {
    function transfer(address to, uint256 amount) external returns (bool);
    function balanceOf(address account) external view returns (uint256);
}

contract GANGRewards {
    address public owner;
    IERC20 public token;
    
    constructor(address _token) {
        owner = msg.sender;
        token = IERC20(_token);
    }
    
    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }
    
    function sendReward(address to, uint256 amount) external onlyOwner returns (bool) {
        return token.transfer(to, amount);
    }
    
    function getBalance() external view returns (uint256) {
        return token.balanceOf(address(this));
    }
    
    function withdrawAll() external onlyOwner {
        uint256 balance = token.balanceOf(address(this));
        require(balance > 0, "No tokens");
        token.transfer(owner, balance);
    }
}"""
    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(code)

@api_router.post("/status", response_model=StatusCheck)
async def create_status_check(input: StatusCheckCreate):
    status_dict = input.model_dump()
    status_obj = StatusCheck(**status_dict)
    
    # Convert to dict and serialize datetime to ISO string for MongoDB
    doc = status_obj.model_dump()
    doc['timestamp'] = doc['timestamp'].isoformat()
    
    _ = await db.status_checks.insert_one(doc)
    return status_obj

@api_router.get("/status", response_model=List[StatusCheck])
async def get_status_checks():
    # Exclude MongoDB's _id field from the query results
    status_checks = await db.status_checks.find({}, {"_id": 0}).to_list(1000)
    
    # Convert ISO string timestamps back to datetime objects
    for check in status_checks:
        if isinstance(check['timestamp'], str):
            check['timestamp'] = datetime.fromisoformat(check['timestamp'])
    
    return status_checks

# ===== Token Price API =====
@api_router.get("/token/price")
async def get_token_price():
    """Fetch current token price from Dexscreener"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(DEXSCREENER_API, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status != 200:
                    return {"success": False, "error": "Failed to fetch data from Dexscreener"}
                data = await resp.json()
                pairs = data.get("pairs", [])
                
                if pairs:
                    p = pairs[0]
                    return {
                        "success": True,
                        "data": {
                            "price_usd": p.get("priceUsd"),
                            "price_native": p.get("priceNative"),
                            "change_m5": p.get("priceChange", {}).get("m5"),
                            "change_h1": p.get("priceChange", {}).get("h1"),
                            "change_h6": p.get("priceChange", {}).get("h6"),
                            "change_h24": p.get("priceChange", {}).get("h24"),
                            "volume_m5": p.get("volume", {}).get("m5"),
                            "volume_h1": p.get("volume", {}).get("h1"),
                            "volume_h6": p.get("volume", {}).get("h6"),
                            "volume_h24": p.get("volume", {}).get("h24"),
                            "liquidity_usd": p.get("liquidity", {}).get("usd"),
                            "market_cap": p.get("fdv"),
                            "buys_h24": p.get("txns", {}).get("h24", {}).get("buys"),
                            "sells_h24": p.get("txns", {}).get("h24", {}).get("sells"),
                            "dex_id": p.get("dexId"),
                            "pair_created_at": p.get("pairCreatedAt"),
                            "base_token": p.get("baseToken", {}).get("symbol"),
                            "quote_token": p.get("quoteToken", {}).get("symbol"),
                        }
                    }
                return {"success": False, "error": "No pairs found"}
    except asyncio.TimeoutError:
        return {"success": False, "error": "Timeout fetching data"}
    except Exception as e:
        logger.error(f"Error fetching token price: {e}")
        return {"success": False, "error": str(e)}

@api_router.get("/token/history")
async def get_token_history():
    """Get price history from database"""
    history = await db.price_history.find({}, {"_id": 0}).sort("timestamp", -1).to_list(100)
    return {"success": True, "data": history}

@api_router.post("/token/record-price")
async def record_price():
    """Record current price to database for history tracking"""
    try:
        async with aiohttp.ClientSession() as session:
            async with session.get(DEXSCREENER_API, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status != 200:
                    return {"success": False, "error": "Failed to fetch data"}
                data = await resp.json()
                pairs = data.get("pairs", [])
                
                if pairs:
                    p = pairs[0]
                    record = {
                        "timestamp": datetime.now(timezone.utc).isoformat(),
                        "price_usd": p.get("priceUsd"),
                        "volume_h24": p.get("volume", {}).get("h24"),
                        "liquidity": p.get("liquidity", {}).get("usd"),
                        "market_cap": p.get("fdv"),
                    }
                    await db.price_history.insert_one(record)
                    # Remove _id from response (MongoDB ObjectId is not JSON serializable)
                    record.pop("_id", None)
                    return {"success": True, "data": record}
                return {"success": False, "error": "No pairs found"}
    except Exception as e:
        logger.error(f"Error recording price: {e}")
        return {"success": False, "error": str(e)}

# ===== Bot Management API =====
@api_router.get("/bot/config")
async def get_bot_config():
    """Get current bot configuration"""
    return {
        "token_masked": BOT_TOKEN[:10] + "..." if BOT_TOKEN else "Not set",
        "contract": CONTRACT,
        "group_id": GROUP_ID,
        "dex_link": os.environ.get("DEX_LINK", "https://cronosgangsters.com"),
        "twitter": os.environ.get("TWITTER", "https://x.com/CronosGangstersDEX"),
        "telegram_group": os.environ.get("TELEGRAM_GROUP", "https://t.me/+DrWDScTEiLg1ZGQ0"),
        "price_update_interval": int(os.environ.get("PRICE_UPDATE_INTERVAL", "300")),
        "dexscreener": f"https://dexscreener.com/cronos/{CONTRACT}",
        "explorer": f"https://explorer.cronos.org/token/{CONTRACT}",
    }

@api_router.get("/bot/status")
async def get_bot_status():
    """Check if bot process is running"""
    global bot_process
    if bot_process is not None and bot_process.poll() is not None:
        # Process has exited — clean up stale reference
        bot_process = None
    is_running = bot_process is not None
    return {
        "running": is_running,
        "pid": bot_process.pid if is_running else None
    }

@api_router.post("/bot/start")
async def start_bot():
    """Start the Telegram bot in background"""
    global bot_process
    
    # Clean up stale process reference
    if bot_process is not None and bot_process.poll() is not None:
        bot_process = None
    
    # Check if already running
    if bot_process is not None:
        return {"success": False, "message": "Bot is already running", "pid": bot_process.pid}
    
    # Kill any leftover telegram_bot.py processes before starting fresh
    try:
        result = subprocess.run(["pkill", "-f", "telegram_bot.py"], capture_output=True)
        await asyncio.sleep(1)
    except Exception:
        pass
    
    try:
        bot_script = ROOT_DIR / "telegram_bot.py"
        bot_process = subprocess.Popen(
            [sys.executable, str(bot_script)],
            cwd=str(ROOT_DIR),
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            start_new_session=True
        )
        await asyncio.sleep(3)  # Give it time to start
        
        if bot_process.poll() is None:
            return {"success": True, "message": "Bot started", "pid": bot_process.pid}
        else:
            stderr = bot_process.stderr.read().decode() if bot_process.stderr else ""
            bot_process = None
            return {"success": False, "message": f"Bot failed to start: {stderr[:500]}"}
    except Exception as e:
        logger.error(f"Error starting bot: {e}")
        return {"success": False, "message": str(e)}

@api_router.post("/bot/stop")
async def stop_bot():
    """Stop the Telegram bot"""
    global bot_process
    
    # Clean up stale process
    if bot_process is not None and bot_process.poll() is not None:
        bot_process = None
        return {"success": True, "message": "Bot was already stopped"}
    
    if bot_process is None:
        # Try to kill any orphaned telegram_bot.py processes
        try:
            subprocess.run(["pkill", "-f", "telegram_bot.py"], capture_output=True)
        except Exception:
            pass
        return {"success": True, "message": "Bot stopped"}
    
    try:
        # First try SIGTERM
        os.killpg(os.getpgid(bot_process.pid), signal.SIGTERM)
        try:
            bot_process.wait(timeout=5)
        except subprocess.TimeoutExpired:
            # Force kill if SIGTERM didn't work
            os.killpg(os.getpgid(bot_process.pid), signal.SIGKILL)
            bot_process.wait(timeout=3)
        bot_process = None
        # Also clean up any orphans
        subprocess.run(["pkill", "-f", "telegram_bot.py"], capture_output=True)
        return {"success": True, "message": "Bot stopped"}
    except Exception as e:
        logger.error(f"Error stopping bot: {e}")
        # Force cleanup
        try:
            subprocess.run(["pkill", "-9", "-f", "telegram_bot.py"], capture_output=True)
        except Exception:
            pass
        bot_process = None
        return {"success": True, "message": "Bot force stopped"}

@api_router.get("/bot/commands")
async def get_bot_commands():
    """Get list of available bot commands"""
    commands = [
        {"command": "/start", "description": "Welcome message & project info"},
        {"command": "/help", "description": "Show all available commands"},
        {"command": "/price", "description": "Current $GANG price with full stats"},
        {"command": "/stats", "description": "Detailed token statistics"},
        {"command": "/contract", "description": "Token contract address"},
        {"command": "/buy", "description": "How to buy $GANG"},
        {"command": "/website", "description": "DEX website link"},
        {"command": "/socials", "description": "Social media links"},
        {"command": "/shill", "description": "Shareable promo message"},
        {"command": "/alert", "description": "Set price alerts"},
        {"command": "/farms", "description": "View yield farms & APRs"},
        {"command": "/vaults", "description": "Auto-compound vaults"},
        {"command": "/staking", "description": "Staking vault info & APYs"},
        {"command": "/launchpad", "description": "IDO launchpad info"},
        {"command": "/locker", "description": "LP token locker"},
        {"command": "/lottery", "description": "Play the lottery"},
        {"command": "/sniper", "description": "Sniper bot info"},
        {"command": "/bridge", "description": "Cross-chain bridge"},
        {"command": "/create", "description": "Token creator"},
        {"command": "/marketplace", "description": "NFT marketplace"},
        {"command": "/nft", "description": "NFT collection info & minting"},
        {"command": "/referral", "description": "Referral program (earn 5%)"},
    ]
    admin_commands = [
        {"command": "/ban", "description": "Ban a user (reply to message)"},
        {"command": "/unban", "description": "Unban a user by ID"},
        {"command": "/mute", "description": "Mute a user (reply to message)"},
        {"command": "/unmute", "description": "Unmute a user"},
        {"command": "/kick", "description": "Kick a user from group"},
        {"command": "/warn", "description": "Warn a user (3 warnings = ban)"},
    ]
    security_features = [
        {"feature": "Human Verification", "description": "Math captcha for new members"},
        {"feature": "Anti-Scam Filter", "description": "Detects scam patterns & suspicious links"},
        {"feature": "Auto-Ban", "description": "3 warnings = automatic ban"},
        {"feature": "Link Whitelist", "description": "Only trusted domains allowed"},
    ]
    return {"commands": commands, "admin_commands": admin_commands, "security": security_features}

# Include the router in the main app
app.include_router(api_router)
app.include_router(mining_router, prefix="/api")
app.include_router(trading_router, prefix="/api")

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()