import logging
import asyncio
import aiohttp
import os
from datetime import datetime, timezone
from telegram import Update, InlineKeyboardButton, InlineKeyboardMarkup, ChatPermissions
from telegram.ext import Application, CommandHandler, MessageHandler, CallbackQueryHandler, filters, ContextTypes
from dotenv import load_dotenv

load_dotenv()

# === CONFIG ===
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN", "")
CONTRACT = os.environ.get("CONTRACT_ADDRESS", "0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF")
DEX_LINK = os.environ.get("DEX_LINK", "https://cronosgangsters.com")
TWITTER = os.environ.get("TWITTER", "https://x.com/AhmadOm93837106")
TELEGRAM_GROUP = os.environ.get("TELEGRAM_GROUP", "https://t.me/+DrWDScTEiLg1ZGQ0")
GROUP_ID = int(os.environ.get("GROUP_ID", "-1003284963991"))
DEXSCREENER = f"https://dexscreener.com/cronos/{CONTRACT}"
EXPLORER = f"https://explorer.cronos.org/token/{CONTRACT}"
PRICE_UPDATE_INTERVAL = int(os.environ.get("PRICE_UPDATE_INTERVAL", "900"))  # 15 minutes default

# Contract Addresses from cronosgangsters.com
CONTRACTS = {
    "GANG": "0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF",
    "MASTERCHEF": "0x3713567b8DB60D7127B2614965eef71cE50871Ea",
    "STAKING": "0x03c3C706F0D2F4754755988A686a70E661e6925F",
    "REFERRAL": "0xd4791929e86EFE7D770b64B6dEC021dE28E8773a",
    "NFT": "0x97489dc06aA00b62B52D7eB6E5b51E8c3dd36431",
    "TREASURY": "0xaA3C5749628610fF410EF9133a4ac4f58e9A52eA",
}

# Farm data from website
FARMS = [
    {"name": "GANG / VVS", "allocation": "10%", "pid": 0},
    {"name": "CRO / GANG", "tvl": "$1.3K", "allocation": "40%", "pid": 1},
    {"name": "GANG / USDC", "tvl": "$201", "allocation": "30%", "pid": 2},
    {"name": "GANG Staking", "allocation": "20%", "pid": 3},
    {"name": "XRP / GANG", "allocation": "15%", "pid": 7},
    {"name": "PEPE / GANG", "allocation": "15%", "pid": 8},
    {"name": "DOGE / GANG", "allocation": "15%", "pid": 9},
]

# Staking tiers from website
STAKING_TIERS = [
    {"period": "6 Months", "apy": "45%", "multiplier": "1x"},
    {"period": "1 Year", "apy": "80%", "multiplier": "1.8x"},
    {"period": "18 Months", "apy": "110%", "multiplier": "2.4x"},
    {"period": "2 Years", "apy": "150%", "multiplier": "3.3x"},
    {"period": "3 Years", "apy": "210%", "multiplier": "4.7x"},
    {"period": "4 Years", "apy": "300%", "multiplier": "MAX"},
]

# NFT Info
NFT_INFO = {
    "total_supply": 500,
    "mint_price": "50 CRO",
    "contract": "0x97489dc06aA00b62B52D7eB6E5b51E8c3dd36431",
    "boost": "+20% Staking Boost",
}

# Vaults Info (Auto-Compound)
VAULTS = [
    {"name": "GANG / WETH", "apy": "~120%", "strategy": "Auto-compound"},
    {"name": "GANG / WBTC", "apy": "~95%", "strategy": "Auto-compound"},
    {"name": "GANG / ATOM", "apy": "~85%", "strategy": "Auto-compound"},
    {"name": "GANG / CROID", "apy": "~110%", "strategy": "Auto-compound"},
    {"name": "GANG / USDT", "apy": "~75%", "strategy": "Auto-compound"},
    {"name": "GANG / FUL", "apy": "~90%", "strategy": "Auto-compound"},
]

# Launchpad Tiers
LAUNCHPAD_TIERS = [
    {"tier": "Bronze", "stake": "1,000 GANG", "allocation": "Base"},
    {"tier": "Silver", "stake": "5,000 GANG", "allocation": "2x"},
    {"tier": "Gold", "stake": "25,000 GANG", "allocation": "5x"},
    {"tier": "Diamond", "stake": "100,000 GANG", "allocation": "10x"},
]

# Token Creator Tiers
TOKEN_CREATOR = {
    "basic": {"price": "25 CRO", "features": "Transfer, Approve, TransferFrom"},
    "premium": {"price": "100 CRO", "features": "Basic + Mint, Burn, Pause"},
    "diamond": {"price": "500 CRO", "features": "Premium + Auto-Liquidity, Auto-Lock LP, Verified Badge"},
}

# Lottery Info
LOTTERY_INFO = {
    "ticket_price": "10 CRO",
    "pool_fee": "10%",
    "draw_frequency": "Weekly",
}

# Sniper Bot Info
SNIPER_INFO = {
    "fee": "1%",
    "features": ["Anti-Rug Protection", "Auto-Buy", "Auto-Sell", "Stop-Loss", "Take-Profit"],
}

# LP Locker Info
LOCKER_INFO = {
    "lock_fee": "1 CRO",
    "burn_option": True,
}

# Bridge Info (LI.FI)
BRIDGE_INFO = {
    "chains": "60+",
    "provider": "LI.FI",
    "supported": ["Ethereum", "BSC", "Polygon", "Arbitrum", "Optimism", "Avalanche", "Fantom"],
}

# Marketplace Info
MARKETPLACE_INFO = {
    "fee": "2.5%",
    "features": ["Buy/Sell NFTs", "Auto-detect Collections", "Cronos NFTs"],
}

# Admin user IDs (add your Telegram user IDs here)
ADMIN_IDS = set(map(int, os.environ.get("ADMIN_IDS", "").split(",") if os.environ.get("ADMIN_IDS") else []))

# Price alert thresholds
price_alerts = {}  # user_id: {"above": price, "below": price}
last_price = None

# ===== ANTI-SCAM & VERIFICATION SYSTEM =====
import random
import re

# Pending verifications: {user_id: {"answer": int, "chat_id": int, "message_id": int, "timestamp": datetime}}
pending_verifications = {}
VERIFICATION_TIMEOUT = 120  # 2 minutes to verify

# Verified users (persistent would need database)
verified_users = set()

# Scam patterns to detect
SCAM_PATTERNS = [
    r"airdrop.*claim",
    r"free.*token",
    r"send.*eth.*receive",
    r"send.*cro.*receive",
    r"double.*your",
    r"validate.*wallet",
    r"connect.*wallet.*claim",
    r"metamask.*support",
    r"trust.*wallet.*support",
    r"admin.*will.*never.*dm",
    r"wallet.*sync",
    r"dapps.*connect",
    r"claim.*reward.*http",
    r"won.*prize.*click",
    r"urgent.*action.*required",
]

# Suspicious link patterns
SUSPICIOUS_DOMAINS = [
    "bit.ly", "tinyurl", "t.co", "goo.gl", "shorturl",
    "discord.gift", "discordapp.gift", "steamcommunity.ru",
]

# Allowed domains (whitelist)
ALLOWED_DOMAINS = [
    "cronosgangsters.com",
    "t.me",
    "telegram.me",
    "dexscreener.com",
    "explorer.cronos.org",
    "cronos.org",
    "x.com",
    "twitter.com",
]

# Warning counts for users
user_warnings_spam = {}  # user_id: count

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)


def format_number(num):
    """Format large numbers with K, M, B suffixes"""
    if num is None or num == "N/A":
        return "N/A"
    try:
        num = float(num)
        if num >= 1_000_000_000:
            return f"${num/1_000_000_000:.2f}B"
        elif num >= 1_000_000:
            return f"${num/1_000_000:.2f}M"
        elif num >= 1_000:
            return f"${num/1_000:.2f}K"
        else:
            return f"${num:.2f}"
    except:
        return "N/A"


def main_keyboard():
    """Main inline keyboard — feature buttons show info inside Telegram"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("💰 Buy $GANG", url=DEX_LINK),
         InlineKeyboardButton("📊 Chart", url=DEXSCREENER)],
        [InlineKeyboardButton("⛏ Mining Hub", callback_data="menu_mining"),
         InlineKeyboardButton("⚡ Trading", callback_data="menu_trading"),
         InlineKeyboardButton("🤖 Dashboard", callback_data="menu_dashboard")],
        [InlineKeyboardButton("🌾 Farms", callback_data="menu_farms"),
         InlineKeyboardButton("🏦 Vaults", callback_data="menu_vaults"),
         InlineKeyboardButton("🔒 Staking", callback_data="menu_staking")],
        [InlineKeyboardButton("🚀 Launchpad", callback_data="menu_launchpad"),
         InlineKeyboardButton("🔐 Token Locker", callback_data="menu_locker"),
         InlineKeyboardButton("🎯 Sniper Bot", callback_data="menu_sniper")],
        [InlineKeyboardButton("🎴 NFTs", callback_data="menu_nft"),
         InlineKeyboardButton("👥 Referral", callback_data="menu_referral"),
         InlineKeyboardButton("🌉 Bridge", callback_data="menu_bridge")],
        [InlineKeyboardButton("🎰 Lottery", callback_data="menu_lottery"),
         InlineKeyboardButton("🛠 Token Creator", callback_data="menu_create"),
         InlineKeyboardButton("🏪 Marketplace", callback_data="menu_marketplace")],
        [InlineKeyboardButton("🌐 Website", url=DEX_LINK),
         InlineKeyboardButton("🐦 Twitter", url=TWITTER)],
    ])


def price_popup_keyboard():
    """Keyboard for price popup with refresh button"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔄 Refresh Price", callback_data="refresh_price")],
        [InlineKeyboardButton("💰 Buy $GANG", url=DEX_LINK),
         InlineKeyboardButton("📊 Full Chart", url=DEXSCREENER)],
        [InlineKeyboardButton("⚠️ Set Price Alert", callback_data="set_alert")],
    ])


def alert_keyboard():
    """Keyboard for setting price alerts"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("🔔 Alert Above Current", callback_data="alert_above"),
         InlineKeyboardButton("🔔 Alert Below Current", callback_data="alert_below")],
        [InlineKeyboardButton("❌ Clear My Alerts", callback_data="clear_alerts")],
        [InlineKeyboardButton("🔙 Back", callback_data="refresh_price")],
    ])


async def fetch_token_data():
    """Fetch comprehensive token data from Dexscreener API"""
    try:
        async with aiohttp.ClientSession() as session:
            url = f"https://api.dexscreener.com/latest/dex/tokens/{CONTRACT}"
            async with session.get(url, timeout=aiohttp.ClientTimeout(total=15)) as resp:
                if resp.status != 200:
                    logger.error(f"Dexscreener API error: {resp.status}")
                    return None
                data = await resp.json()
                pairs = data.get("pairs", [])
                if pairs:
                    return pairs[0]
                return None
    except asyncio.TimeoutError:
        logger.error("Timeout fetching token data")
        return None
    except Exception as e:
        logger.error(f"Error fetching token data: {e}")
        return None


async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /start command"""
    msg = (
        "🔫 *$GANG - Cronos Gangsters*\n"
        "━━━━━━━━━━━━━━━━━━━━━\n\n"
        "The Most Gangster DEX on Cronos!\n\n"
        f"📋 *Contract:*\n`{CONTRACT}`\n\n"
        "━━━ *EARN FREE $GANG* ━━━\n\n"
        "⛏ *Mining Hub* — Earn 5 $GANG daily for FREE!\n"
        "🎰 *19 Casino Games* — Slots, Crash, Roulette, Poker & more!\n"
        "🏇 *Racing* — Horse & Car racing!\n"
        "⚡ *Leverage Trading* — 8 pairs, up to 100x with live charts!\n"
        "💰 *Reach 100 $GANG → Withdraw REAL tokens!*\n\n"
        "━━━ *DeFi FEATURES* ━━━\n\n"
        "🌾 Farms — Yield farming with LP\n"
        "🏦 Vaults — Auto-compound pools\n"
        "🔒 Staking — Lock $GANG for APY\n"
        "🌉 Bridge — Cross-chain transfers\n"
        "🔐 Token Locker — Lock LP tokens\n\n"
        "━━━ *MORE* ━━━\n\n"
        "🚀 Launchpad — IDO access\n"
        "🎯 Sniper Bot — Fast trading\n"
        "🎴 NFTs — 500 unique gangsters\n"
        "👥 Referral — Earn 5% from crew\n"
        "🛠 Token Creator — Deploy tokens\n"
        "🏪 Marketplace — Trade NFTs\n\n"
        "🔥 *START MINING NOW!* Tap ⛏ Mining Hub below!\n\n"
        "👇 *Tap any button to explore!*"
    )
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=main_keyboard())


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /help command - list all available commands"""
    is_admin = update.effective_user.id in ADMIN_IDS
    
    msg = (
        "📖 *Cronos Gangsters Bot Commands*\n\n"
        "*💰 Token & Price:*\n"
        "• /price - Current $GANG price & stats\n"
        "• /stats - Detailed token statistics\n"
        "• /contract - Token contract address\n"
        "• /alert - Set price alerts\n\n"
        "*⛏ Mining & Gaming:*\n"
        "• /mining - Mining Hub (earn $GANG daily!)\n"
        "• /trading - Leverage Trading (up to 100x)\n\n"
        "*🌾 DeFi Features:*\n"
        "• /farms - Yield farms & APRs\n"
        "• /vaults - Auto-compound vaults\n"
        "• /staking - Staking vault info\n"
        "• /launchpad - IDO launchpad\n"
        "• /locker - LP token locker\n"
        "• /bridge - Cross-chain bridge\n\n"
        "*🎮 Extras:*\n"
        "• /lottery - Play the lottery\n"
        "• /sniper - Sniper bot info\n"
        "• /create - Token creator\n"
        "• /marketplace - NFT marketplace\n"
        "• /nft - NFT collection info\n"
        "• /referral - Earn 5% referrals\n\n"
        "*📱 Links:*\n"
        "• /buy - How to buy $GANG\n"
        "• /website - DEX website\n"
        "• /socials - Social media links\n"
        "• /shill - Shareable promo\n"
    )
    
    if is_admin:
        msg += (
            "\n*🔐 Admin Commands:*\n"
            "• /ban - Ban a user\n"
            "• /unban - Unban by ID\n"
            "• /mute - Mute a user\n"
            "• /unmute - Unmute a user\n"
            "• /warn - Warn (3 = ban)\n"
            "• /kick - Kick from group\n"
        )
    
    msg += "\n"
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=main_keyboard())


async def contract(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /contract command"""
    msg = (
        "📋 *$GANG Contract Address*\n\n"
        f"`{CONTRACT}`\n\n"
        f"🔍 [View on Explorer]({EXPLORER})"
    )
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=main_keyboard())


async def buy(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /buy command"""
    msg = (
        "💰 *How to Buy $GANG*\n\n"
        "1️⃣ Get CRO from any exchange\n"
        "2️⃣ Connect wallet to cronosgangsters.com\n"
        "3️⃣ Swap CRO for $GANG\n"
        "4️⃣ Welcome to the family! 🔫\n\n"
        f"🌐 [Buy Now]({DEX_LINK})"
    )
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=main_keyboard())


async def website(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /website command"""
    msg = f"🌐 *Cronos Gangsters DEX*\n\n{DEX_LINK}\n\nThe most ruthless DEX on Cronos!"
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=main_keyboard())


async def socials(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /socials command"""
    msg = (
        "📱 *Cronos Gangsters Socials*\n\n"
        f"🐦 Twitter: {TWITTER}\n"
        f"💬 Telegram: {TELEGRAM_GROUP}\n"
        f"🌐 Website: {DEX_LINK}"
    )
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=main_keyboard())


async def price(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /price command with full price popup"""
    global last_price
    
    token_data = await fetch_token_data()
    
    if token_data:
        price_usd = token_data.get("priceUsd", "N/A")
        change_h1 = token_data.get("priceChange", {}).get("h1", "N/A")
        change_h6 = token_data.get("priceChange", {}).get("h6", "N/A")
        change_h24 = token_data.get("priceChange", {}).get("h24", "N/A")
        volume_h24 = token_data.get("volume", {}).get("h24", "N/A")
        liquidity = token_data.get("liquidity", {}).get("usd", "N/A")
        market_cap = token_data.get("fdv", "N/A")  # Fully diluted valuation
        txns_h24 = token_data.get("txns", {}).get("h24", {})
        buys_h24 = txns_h24.get("buys", "N/A")
        sells_h24 = txns_h24.get("sells", "N/A")
        
        # Store last price for alerts
        try:
            last_price = float(price_usd)
        except:
            pass
        
        # Format change with emoji
        def format_change(change):
            try:
                c = float(change)
                emoji = "🟢" if c >= 0 else "🔴"
                return f"{emoji} {c:+.2f}%"
            except:
                return "N/A"
        
        msg = (
            f"💰 *$GANG Price*\n\n"
            f"💵 *Price:* ${price_usd}\n\n"
            f"📈 *Price Changes:*\n"
            f"   • 1H: {format_change(change_h1)}\n"
            f"   • 6H: {format_change(change_h6)}\n"
            f"   • 24H: {format_change(change_h24)}\n\n"
            f"📊 *Market Data:*\n"
            f"   • Volume 24H: {format_number(volume_h24)}\n"
            f"   • Liquidity: {format_number(liquidity)}\n"
            f"   • Market Cap: {format_number(market_cap)}\n\n"
            f"🔄 *24H Transactions:*\n"
            f"   • Buys: {buys_h24} | Sells: {sells_h24}\n\n"
            f"🕐 Updated: {datetime.now(timezone.utc).strftime('%H:%M:%S UTC')}"
        )
    else:
        msg = (
            f"💰 *$GANG Token*\n\n"
            "⚠️ Unable to fetch price data\n"
            f"[View Chart]({DEXSCREENER})"
        )
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=price_popup_keyboard())


async def stats(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /stats command with detailed statistics"""
    token_data = await fetch_token_data()
    
    if token_data:
        price_usd = token_data.get("priceUsd", "N/A")
        price_native = token_data.get("priceNative", "N/A")
        change_m5 = token_data.get("priceChange", {}).get("m5", "N/A")
        change_h1 = token_data.get("priceChange", {}).get("h1", "N/A")
        change_h6 = token_data.get("priceChange", {}).get("h6", "N/A")
        change_h24 = token_data.get("priceChange", {}).get("h24", "N/A")
        volume_m5 = token_data.get("volume", {}).get("m5", "N/A")
        volume_h1 = token_data.get("volume", {}).get("h1", "N/A")
        volume_h6 = token_data.get("volume", {}).get("h6", "N/A")
        volume_h24 = token_data.get("volume", {}).get("h24", "N/A")
        liquidity = token_data.get("liquidity", {}).get("usd", "N/A")
        market_cap = token_data.get("fdv", "N/A")
        pair_created = token_data.get("pairCreatedAt", None)
        dex_id = token_data.get("dexId", "Unknown")
        
        # Calculate age
        age_str = "Unknown"
        if pair_created:
            try:
                created_dt = datetime.fromtimestamp(pair_created/1000, tz=timezone.utc)
                age = datetime.now(timezone.utc) - created_dt
                days = age.days
                age_str = f"{days} days"
            except:
                pass
        
        msg = (
            f"📊 *$GANG Detailed Statistics*\n\n"
            f"💵 *Current Price:*\n"
            f"   • USD: ${price_usd}\n"
            f"   • CRO: {price_native}\n\n"
            f"📈 *Price Changes:*\n"
            f"   • 5M: {change_m5}%\n"
            f"   • 1H: {change_h1}%\n"
            f"   • 6H: {change_h6}%\n"
            f"   • 24H: {change_h24}%\n\n"
            f"📊 *Volume:*\n"
            f"   • 5M: {format_number(volume_m5)}\n"
            f"   • 1H: {format_number(volume_h1)}\n"
            f"   • 6H: {format_number(volume_h6)}\n"
            f"   • 24H: {format_number(volume_h24)}\n\n"
            f"💎 *Market Info:*\n"
            f"   • Market Cap: {format_number(market_cap)}\n"
            f"   • Liquidity: {format_number(liquidity)}\n"
            f"   • DEX: {dex_id.upper()}\n"
            f"   • Age: {age_str}\n\n"
            f"📋 Contract:\n`{CONTRACT}`"
        )
    else:
        msg = (
            f"📊 *$GANG Statistics*\n\n"
            "⚠️ Unable to fetch data\n"
            f"[View on Dexscreener]({DEXSCREENER})"
        )
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=main_keyboard())


async def shill(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /shill command - shareable promo message"""
    token_data = await fetch_token_data()
    
    price_line = ""
    if token_data:
        price_usd = token_data.get("priceUsd", "N/A")
        price_line = f"\n💰 Price: ${price_usd}"
    
    msg = (
        f"🔫 *$GANG - Cronos Gangsters*\n\n"
        f"The most gangster DEX on Cronos!{price_line}\n\n"
        "⛏ Mine 5 $GANG daily + 19 Casino Games!\n"
        "⚡ Leverage Trading up to 100x!\n"
        "🌾 Farm | 🏦 Vault | 🔒 Stake | 🌉 Bridge\n\n"
        f"📋 Contract:\n`{CONTRACT}`\n\n"
        "Join the gang! The streets are ours. 🤝\n\n"
        f"🌐 Website: {DEX_LINK}\n"
        f"📊 Chart: {DEXSCREENER}\n"
        f"💬 Telegram: {TELEGRAM_GROUP}"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("💰 Buy $GANG", url=DEX_LINK),
         InlineKeyboardButton("📊 Chart", url=DEXSCREENER)],
        [InlineKeyboardButton("⛏ Mine $GANG", url=f"{DEX_LINK}/mining.html")],
        [InlineKeyboardButton("💬 Join Telegram", url=TELEGRAM_GROUP)],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def alert(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /alert command"""
    user_id = update.effective_user.id
    user_alerts = price_alerts.get(user_id, {})
    
    alert_status = ""
    if user_alerts:
        if user_alerts.get("above"):
            alert_status += f"🔔 Alert when above: ${user_alerts['above']:.6f}\n"
        if user_alerts.get("below"):
            alert_status += f"🔔 Alert when below: ${user_alerts['below']:.6f}\n"
    else:
        alert_status = "No alerts set"
    
    current_price = "N/A"
    if last_price:
        current_price = f"${last_price:.6f}"
    
    msg = (
        f"⚠️ *Price Alerts*\n\n"
        f"💵 Current Price: {current_price}\n\n"
        f"*Your Alerts:*\n{alert_status}\n\n"
        "Use buttons below to set alerts:"
    )
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=alert_keyboard())


async def farms(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /farms command - show yield farming info"""
    msg = (
        "🌾 *GANGSTER FARMS*\n\n"
        "Stake LP tokens to earn $GANG rewards!\n\n"
    )
    
    for farm in FARMS:
        msg += (
            f"*{farm['name']}*\n"
            f"   • APR: {farm['apr']}\n"
            f"   • Allocation: {farm['allocation']}\n"
        )
        if 'tvl' in farm:
            msg += f"   • TVL: {farm['tvl']}\n"
        msg += "\n"
    
    msg += (
        f"🔗 *MasterChef Contract:*\n"
        f"`{CONTRACTS['MASTERCHEF']}`\n\n"
        f"[🌾 Start Farming]({DEX_LINK})"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🌾 Open Farms", url=f"{DEX_LINK}#farms"),
         InlineKeyboardButton("📊 Chart", url=DEXSCREENER)],
        [InlineKeyboardButton("💰 Buy $GANG First", url=DEX_LINK)],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def staking(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /staking command - show staking vault info"""
    msg = (
        "🔒 *$GANG STAKING VAULT*\n\n"
        "Lock $GANG for boosted rewards!\n"
        "Longer lock = bigger APY\n\n"
        "*Staking Tiers:*\n"
    )
    
    for tier in STAKING_TIERS:
        emoji = "🔥" if tier['multiplier'] == "MAX" else "✓"
        msg += f"• *{tier['period']}*: {tier['apy']} APY ({tier['multiplier']}) {emoji}\n"
    
    msg += (
        f"\n🎴 *+20% NFT Holder Boost Active!*\n"
        f"Hold a Gangster NFT for bonus rewards.\n\n"
        f"⚠️ Early Exit Penalty: *25%* of staked amount\n\n"
        f"🔗 *Staking Contract:*\n"
        f"`{CONTRACTS['STAKING']}`"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🔒 Stake $GANG", url=f"{DEX_LINK}#staking"),
         InlineKeyboardButton("🎴 Get NFT Boost", url=f"{DEX_LINK}#nfts")],
        [InlineKeyboardButton("💰 Buy $GANG First", url=DEX_LINK)],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def nft(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /nft command - show NFT collection info"""
    msg = (
        "🎴 *CRONOS GANGSTERS NFTs*\n\n"
        "500 Unique Gangsters on Cronos!\n"
        "Own One, Join the Family.\n\n"
        f"💰 *Mint Price:* {NFT_INFO['mint_price']}\n"
        f"📦 *Total Supply:* {NFT_INFO['total_supply']}\n"
        f"⚡ *Utility:* {NFT_INFO['boost']}\n\n"
        "*Rarity Tiers:*\n"
        "• Legendary: 2.4%\n"
        "• Epic: 6%\n"
        "• Rare: 31%\n"
        "• Uncommon: 7.6%\n"
        "• Common: 52.8%\n\n"
        f"🔗 *NFT Contract:*\n"
        f"`{NFT_INFO['contract']}`"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🎴 Mint NFT", url=f"{DEX_LINK}#nfts"),
         InlineKeyboardButton("🖼 View Gallery", url=f"{DEX_LINK}#nfts")],
        [InlineKeyboardButton("🔒 Stake with NFT Boost", url=f"{DEX_LINK}#staking")],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def referral(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /referral command - show referral program info"""
    msg = (
        "👥 *INVITE THE FAMILY*\n\n"
        "Share your link. Earn *5%* in $GANG\n"
        "when your crew swaps!\n\n"
        "*How It Works:*\n"
        "1️⃣ Connect wallet on cronosgangsters.com\n"
        "2️⃣ Copy your unique invite link\n"
        "3️⃣ Share it with friends\n"
        "4️⃣ Earn 5% of their swap value in $GANG\n"
        "5️⃣ Claim rewards anytime!\n\n"
        "🔗 *Referral Contract:*\n"
        f"`{CONTRACTS['REFERRAL']}`\n\n"
        f"[🔗 Get Your Referral Link]({DEX_LINK}#referral)"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🔗 Get Referral Link", url=f"{DEX_LINK}#referral")],
        [InlineKeyboardButton("📢 Share on Telegram", url=f"https://t.me/share/url?url={DEX_LINK}"),
         InlineKeyboardButton("🐦 Share on X", url=f"https://twitter.com/intent/tweet?text=Join%20Cronos%20Gangsters%20DEX!%20{DEX_LINK}")],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


# ===== NEW COMMANDS (8 MISSING FEATURES) =====

async def vaults(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /vaults command - show auto-compound vault info"""
    msg = (
        "🏦 *AUTO-COMPOUND VAULTS*\n\n"
        "Deposit and let us compound for you!\n"
        "No manual harvesting needed.\n\n"
    )
    
    for vault in VAULTS:
        msg += (
            f"*{vault['name']}*\n"
            f"   • APY: {vault['apy']}\n"
            f"   • Strategy: {vault['strategy']}\n\n"
        )
    
    msg += (
        "💡 *How it works:*\n"
        "1. Deposit LP tokens\n"
        "2. Vault auto-compounds rewards\n"
        "3. Watch your position grow!\n\n"
        f"[🏦 Open Vaults]({DEX_LINK})"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🏦 Open Vaults", url=f"{DEX_LINK}#vaults"),
         InlineKeyboardButton("📊 Chart", url=DEXSCREENER)],
        [InlineKeyboardButton("💰 Buy $GANG", url=DEX_LINK)],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def launchpad(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /launchpad command - show IDO launchpad info"""
    msg = (
        "🚀 *GANGSTER LAUNCHPAD*\n\n"
        "Participate in IDOs. Get early access to new tokens!\n\n"
        "*Staking Tiers:*\n"
    )
    
    for tier in LAUNCHPAD_TIERS:
        emoji = "💎" if tier['tier'] == "Diamond" else "🥇" if tier['tier'] == "Gold" else "🥈" if tier['tier'] == "Silver" else "🥉"
        msg += f"{emoji} *{tier['tier']}*: Stake {tier['stake']} → {tier['allocation']} allocation\n"
    
    msg += (
        "\n*How to participate:*\n"
        "1️⃣ Stake $GANG to reach a tier\n"
        "2️⃣ Wait for IDO announcement\n"
        "3️⃣ Contribute during sale window\n"
        "4️⃣ Claim tokens at TGE\n\n"
        "💰 *Platform Fee:* 3% of raised funds\n\n"
        f"[🚀 View Launchpad]({DEX_LINK})"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🚀 Open Launchpad", url=f"{DEX_LINK}#launchpad"),
         InlineKeyboardButton("🔒 Stake $GANG", url=f"{DEX_LINK}#staking")],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def locker(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /locker command - show LP locker info"""
    msg = (
        "🔐 *LP LOCKER*\n\n"
        "Lock your LP tokens to build trust!\n"
        "Show investors your liquidity is safe.\n\n"
        "*Features:*\n"
        "• Lock any LP token\n"
        "• Choose lock duration\n"
        "• Option to burn LP (permanent)\n"
        "• Verified on DexScreener\n"
        "• Public lock verification\n\n"
        f"💰 *Lock Fee:* {LOCKER_INFO['lock_fee']} per lock\n\n"
        "*Why lock LP?*\n"
        "✓ Prevents rug pulls\n"
        "✓ Builds investor confidence\n"
        "✓ Shows on chart platforms\n\n"
        f"[🔐 Lock Your LP]({DEX_LINK})"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🔐 Open Locker", url=f"{DEX_LINK}#locker"),
         InlineKeyboardButton("🔥 Burn LP", url=f"{DEX_LINK}#locker")],
        [InlineKeyboardButton("✅ Verify Lock", url=f"{DEX_LINK}#locker")],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def lottery(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /lottery command - show lottery info"""
    msg = (
        "🎰 *GANGSTER LOTTERY*\n\n"
        "Buy tickets. Win the pot!\n\n"
        f"🎟 *Ticket Price:* {LOTTERY_INFO['ticket_price']}\n"
        f"🏆 *Pool Fee:* {LOTTERY_INFO['pool_fee']} (to platform)\n"
        f"⏰ *Draw:* {LOTTERY_INFO['draw_frequency']}\n\n"
        "*How it works:*\n"
        "1️⃣ Buy lottery tickets (10 CRO each)\n"
        "2️⃣ Each ticket = 1 entry\n"
        "3️⃣ Random winner drawn weekly\n"
        "4️⃣ Winner takes 90% of the pot!\n\n"
        "🍀 *Good luck, gangster!*\n\n"
        f"[🎰 Play Lottery]({DEX_LINK})"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🎟 Buy Tickets", url=f"{DEX_LINK}#lottery"),
         InlineKeyboardButton("🏆 View Pot", url=f"{DEX_LINK}#lottery")],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def sniper(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /sniper command - show sniper bot info"""
    features_list = "\n".join([f"   ✓ {f}" for f in SNIPER_INFO['features']])
    
    msg = (
        "🎯 *GANGSTER SNIPER BOT*\n\n"
        "Trade faster than everyone else!\n\n"
        f"💰 *Trading Fee:* {SNIPER_INFO['fee']} per trade\n\n"
        "*Features:*\n"
        f"{features_list}\n\n"
        "*Commands:*\n"
        "• `/snipe <token>` - Snipe a token\n"
        "• `/buy <amount>` - Quick buy\n"
        "• `/sell <amount>` - Quick sell\n"
        "• `/sl <price>` - Set stop-loss\n"
        "• `/tp <price>` - Set take-profit\n\n"
        "⚠️ *Anti-Rug Protection:*\n"
        "Bot checks for honeypots & rugs!\n\n"
        f"[🎯 Start Sniping]({DEX_LINK})"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🎯 Open Sniper", url=f"{DEX_LINK}#sniper"),
         InlineKeyboardButton("⚙️ Settings", url=f"{DEX_LINK}#sniper")],
        [InlineKeyboardButton("📖 Tutorial", url=f"{DEX_LINK}#sniper")],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def bridge(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /bridge command - show cross-chain bridge info"""
    chains_list = ", ".join(BRIDGE_INFO['supported'][:5]) + "..."
    
    msg = (
        "🌉 *CROSS-CHAIN BRIDGE*\n\n"
        f"Bridge assets across {BRIDGE_INFO['chains']} chains!\n"
        f"Powered by {BRIDGE_INFO['provider']}\n\n"
        "*Supported Chains:*\n"
        f"{chains_list}\n\n"
        "*How to bridge:*\n"
        "1️⃣ Select source chain\n"
        "2️⃣ Select destination (Cronos)\n"
        "3️⃣ Choose token & amount\n"
        "4️⃣ Approve & bridge!\n\n"
        "💡 *Best rates aggregated automatically*\n\n"
        f"[🌉 Open Bridge]({DEX_LINK})"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🌉 Bridge to Cronos", url=f"{DEX_LINK}#bridge"),
         InlineKeyboardButton("🌉 Bridge from Cronos", url=f"{DEX_LINK}#bridge")],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def create(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /create command - show token creator info"""
    msg = (
        "🛠 *TOKEN CREATOR*\n\n"
        "Deploy your own token on Cronos in seconds!\n\n"
        "*Pricing Tiers:*\n\n"
        f"🟢 *BASIC* — {TOKEN_CREATOR['basic']['price']}\n"
        f"   {TOKEN_CREATOR['basic']['features']}\n\n"
        f"🟡 *PREMIUM* — {TOKEN_CREATOR['premium']['price']}\n"
        f"   {TOKEN_CREATOR['premium']['features']}\n\n"
        f"💎 *DIAMOND* — {TOKEN_CREATOR['diamond']['price']}\n"
        f"   {TOKEN_CREATOR['diamond']['features']}\n\n"
        "*What you get:*\n"
        "✓ Verified source code\n"
        "✓ Instant deployment\n"
        "✓ Full ownership\n"
        "✓ CronoScan verified\n\n"
        f"[🛠 Create Token]({DEX_LINK})"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🟢 Basic (25 CRO)", url=f"{DEX_LINK}#create"),
         InlineKeyboardButton("🟡 Premium (100 CRO)", url=f"{DEX_LINK}#create")],
        [InlineKeyboardButton("💎 Diamond (500 CRO)", url=f"{DEX_LINK}#create")],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def marketplace(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /marketplace command - show NFT marketplace info"""
    msg = (
        "🏪 *NFT MARKETPLACE*\n\n"
        "Buy & sell any NFT on Cronos!\n\n"
        f"💰 *Trading Fee:* {MARKETPLACE_INFO['fee']} on sales\n\n"
        "*Features:*\n"
        "• List any Cronos NFT\n"
        "• Auto-detect collections\n"
        "• Instant settlements\n"
        "• No listing fees\n"
        "• Royalties supported\n\n"
        "*How to sell:*\n"
        "1️⃣ Connect wallet\n"
        "2️⃣ Select NFT to list\n"
        "3️⃣ Set your price\n"
        "4️⃣ Approve & list!\n\n"
        "*How to buy:*\n"
        "1️⃣ Browse listings\n"
        "2️⃣ Click Buy\n"
        "3️⃣ Confirm transaction\n"
        "4️⃣ NFT is yours!\n\n"
        f"[🏪 Open Marketplace]({DEX_LINK})"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🏪 Browse NFTs", url=f"{DEX_LINK}#marketplace"),
         InlineKeyboardButton("📤 Sell NFT", url=f"{DEX_LINK}#marketplace")],
        [InlineKeyboardButton("🎴 My NFTs", url=f"{DEX_LINK}#nfts")],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def mining(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /mining command - show mining hub info"""
    msg = (
        "⛏ *$GANG MINING HUB*\n"
        "━━━━━━━━━━━━━━━━━━━━━\n\n"
        "🔥 *EARN REAL $GANG TOKENS FOR FREE!*\n\n"
        "━━━ *HOW IT WORKS* ━━━\n\n"
        "1️⃣ *TAP TO MINE* — Earn 5 $GANG daily for free!\n"
        "2️⃣ *PLAY & MULTIPLY* — 19 casino games + leverage trading\n"
        "3️⃣ *REACH 100 $GANG* — Withdraw button unlocks\n"
        "4️⃣ *GET REAL TOKENS* — Sent to your wallet! (5% burn)\n\n"
        "🎰 Slots • Crash • Roulette • Blackjack • Racing & more!\n"
        "👥 Refer friends — earn 10% bonus!\n"
        "💰 25,000 $GANG in reward pool!\n\n"
        "👇 *Start mining NOW!*"
    )
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("⛏ START MINING NOW", url=f"{DEX_LINK}/mining.html")],
        [InlineKeyboardButton("⚡ Leverage Trading", url=f"{DEX_LINK}/trading.html")],
        [InlineKeyboardButton("👥 Referral Link", url=f"{DEX_LINK}/mining.html")],
    ])
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


async def trading(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /trading command - show leverage trading info"""
    msg = (
        "⚡ *LEVERAGE TRADING*\n"
        "━━━━━━━━━━━━━━━━━━━━━\n\n"
        "📈 *Trade crypto with up to 100x LEVERAGE!*\n\n"
        "1️⃣ Mine $GANG from the Mining Hub (free!)\n"
        "2️⃣ Pick a pair — BTC, ETH, SOL, DOGE, PEPE & more\n"
        "3️⃣ Go LONG (price up) or SHORT (price down)\n"
        "4️⃣ Set leverage: 10x, 25x, 50x, or 100x\n"
        "5️⃣ Close anytime to lock in profits!\n\n"
        "📊 *Live TradingView charts for every pair!*\n"
        "💰 0.1% trading fee | ⚠️ High risk = high reward!\n\n"
        "👇 *Start trading NOW!*"
    )
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("⚡ START TRADING NOW", url=f"{DEX_LINK}/trading.html")],
        [InlineKeyboardButton("⛏ Mine $GANG First", url=f"{DEX_LINK}/mining.html")],
        [InlineKeyboardButton("📊 Chart", url=DEXSCREENER)],
    ])
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)


# ===== ANTI-SCAM & VERIFICATION FUNCTIONS =====

def generate_captcha():
    """Generate a simple math captcha"""
    a = random.randint(1, 10)
    b = random.randint(1, 10)
    operators = [('+', a + b), ('-', abs(a - b)), ('×', a * b)]
    op, answer = random.choice(operators)
    if op == '-':
        a, b = max(a, b), min(a, b)
        answer = a - b
    question = f"{a} {op} {b}"
    return question, answer


def check_scam_patterns(text):
    """Check if text contains scam patterns"""
    text_lower = text.lower()
    for pattern in SCAM_PATTERNS:
        if re.search(pattern, text_lower):
            return True
    return False


def check_suspicious_links(text):
    """Check for suspicious links"""
    # Find all URLs
    urls = re.findall(r'https?://[^\s]+|www\.[^\s]+', text.lower())
    
    for url in urls:
        # Check if it's a suspicious domain
        for sus_domain in SUSPICIOUS_DOMAINS:
            if sus_domain in url:
                return True
        
        # Check if it's NOT in allowed domains
        is_allowed = False
        for allowed in ALLOWED_DOMAINS:
            if allowed in url:
                is_allowed = True
                break
        
        if not is_allowed and urls:
            return True  # Unknown domain with link = suspicious
    
    return False


def verification_keyboard(answer):
    """Generate verification keyboard with wrong options"""
    options = [answer]
    while len(options) < 4:
        wrong = random.randint(0, 20)
        if wrong not in options:
            options.append(wrong)
    random.shuffle(options)
    
    buttons = [[InlineKeyboardButton(str(opt), callback_data=f"verify_{opt}") for opt in options]]
    return InlineKeyboardMarkup(buttons)


async def welcome_new_member(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Welcome new members with verification captcha"""
    for member in update.message.new_chat_members:
        if member.is_bot:
            continue
        
        user_id = member.id
        chat_id = update.effective_chat.id
        name = member.first_name or "Gangster"
        
        # Generate captcha
        question, answer = generate_captcha()
        
        # Restrict user until verified
        try:
            await context.bot.restrict_chat_member(
                chat_id,
                user_id,
                permissions=ChatPermissions(
                    can_send_messages=False,
                    can_send_other_messages=False,
                    can_add_web_page_previews=False
                )
            )
        except Exception as e:
            logger.error(f"Failed to restrict user: {e}")
        
        # Send verification message
        msg = (
            f"🔫 *Welcome, {name}!*\n\n"
            f"⚠️ *HUMAN VERIFICATION REQUIRED*\n\n"
            f"To protect our family from bots and scammers, "
            f"please solve this:\n\n"
            f"🧮 *What is {question}?*\n\n"
            f"⏰ You have {VERIFICATION_TIMEOUT} seconds.\n"
            f"Wrong answer = kicked."
        )
        
        sent_msg = await update.message.reply_text(
            msg, 
            parse_mode="Markdown",
            reply_markup=verification_keyboard(answer)
        )
        
        # Store pending verification
        pending_verifications[user_id] = {
            "answer": answer,
            "chat_id": chat_id,
            "message_id": sent_msg.message_id,
            "timestamp": datetime.now(timezone.utc),
            "name": name
        }
        
        # Schedule timeout check
        context.job_queue.run_once(
            verification_timeout,
            VERIFICATION_TIMEOUT,
            data={"user_id": user_id, "chat_id": chat_id},
            name=f"verify_timeout_{user_id}"
        )


async def verification_timeout(context: ContextTypes.DEFAULT_TYPE):
    """Handle verification timeout - kick user"""
    data = context.job.data
    user_id = data["user_id"]
    chat_id = data["chat_id"]
    
    if user_id in pending_verifications:
        try:
            # Kick user
            await context.bot.ban_chat_member(chat_id, user_id)
            await context.bot.unban_chat_member(chat_id, user_id)  # Allow rejoin
            
            # Delete verification message
            msg_id = pending_verifications[user_id].get("message_id")
            if msg_id:
                try:
                    await context.bot.delete_message(chat_id, msg_id)
                except:
                    pass
            
            await context.bot.send_message(
                chat_id,
                "⏰ User failed to verify in time and was removed.",
                parse_mode="Markdown"
            )
        except Exception as e:
            logger.error(f"Timeout kick error: {e}")
        
        del pending_verifications[user_id]


async def handle_verification_callback(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle verification button clicks"""
    query = update.callback_query
    user_id = query.from_user.id
    
    if not query.data.startswith("verify_"):
        return False
    
    if user_id not in pending_verifications:
        await query.answer("This verification is not for you!", show_alert=True)
        return True
    
    selected = int(query.data.replace("verify_", ""))
    correct_answer = pending_verifications[user_id]["answer"]
    chat_id = pending_verifications[user_id]["chat_id"]
    name = pending_verifications[user_id]["name"]
    
    # Cancel timeout job
    jobs = context.job_queue.get_jobs_by_name(f"verify_timeout_{user_id}")
    for job in jobs:
        job.schedule_removal()
    
    if selected == correct_answer:
        # Correct! Unrestrict user
        try:
            await context.bot.restrict_chat_member(
                chat_id,
                user_id,
                permissions=ChatPermissions(
                    can_send_messages=True,
                    can_send_other_messages=True,
                    can_add_web_page_previews=True,
                    can_send_polls=True,
                    can_invite_users=True
                )
            )
            
            verified_users.add(user_id)
            
            await query.edit_message_text(
                f"✅ *Welcome to the family, {name}!*\n\n"
                f"You've been verified. GANG or nothing! 🔫\n\n"
                f"💰 Use /help to see all commands\n"
                f"📊 Use /price to check $GANG price\n"
                f"🌐 Website: {DEX_LINK}",
                parse_mode="Markdown",
                reply_markup=main_keyboard()
            )
        except Exception as e:
            logger.error(f"Verify unrestrict error: {e}")
            await query.answer("Error during verification. Contact admin.")
    else:
        # Wrong answer - kick
        try:
            await context.bot.ban_chat_member(chat_id, user_id)
            await context.bot.unban_chat_member(chat_id, user_id)
            
            await query.edit_message_text(
                f"❌ Wrong answer! {name} has been removed.\n"
                f"They can rejoin and try again."
            )
        except Exception as e:
            logger.error(f"Verify kick error: {e}")
    
    del pending_verifications[user_id]
    return True


async def anti_scam_filter(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Filter messages for scams and spam"""
    if not update.message or not update.message.text:
        return
    
    user_id = update.effective_user.id
    chat_id = update.effective_chat.id
    text = update.message.text
    
    # Skip admins
    if user_id in ADMIN_IDS:
        return
    
    try:
        member = await context.bot.get_chat_member(chat_id, user_id)
        if member.status in ["administrator", "creator"]:
            return
    except:
        pass
    
    # Check for scam patterns
    if check_scam_patterns(text):
        await handle_scam_detection(update, context, "scam pattern")
        return
    
    # Check for suspicious links (only for unverified or new users)
    if user_id not in verified_users:
        if check_suspicious_links(text):
            await handle_scam_detection(update, context, "suspicious link")
            return


async def handle_scam_detection(update: Update, context: ContextTypes.DEFAULT_TYPE, reason: str):
    """Handle detected scam attempt"""
    user_id = update.effective_user.id
    chat_id = update.effective_chat.id
    user_name = update.effective_user.first_name or "User"
    
    # Delete the message
    try:
        await update.message.delete()
    except:
        pass
    
    # Add warning
    if user_id not in user_warnings_spam:
        user_warnings_spam[user_id] = 0
    user_warnings_spam[user_id] += 1
    
    warnings = user_warnings_spam[user_id]
    
    if warnings >= 2:
        # Ban on 2nd offense
        try:
            await context.bot.ban_chat_member(chat_id, user_id)
            await context.bot.send_message(
                chat_id,
                f"🚫 *{user_name}* banned for repeated {reason}.\n"
                f"We don't tolerate scammers here! 🔫",
                parse_mode="Markdown"
            )
        except Exception as e:
            logger.error(f"Ban error: {e}")
    else:
        # Warn on first offense
        try:
            await context.bot.send_message(
                chat_id,
                f"⚠️ *Warning to {user_name}*\n\n"
                f"Your message was removed ({reason}).\n"
                f"Warnings: {warnings}/2\n"
                f"Next offense = BAN 🔨",
                parse_mode="Markdown"
            )
        except Exception as e:
            logger.error(f"Warning error: {e}")


async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle button callbacks"""
    global last_price
    query = update.callback_query
    
    user_id = update.effective_user.id
    
    # Handle verification callbacks first
    if query.data.startswith("verify_"):
        handled = await handle_verification_callback(update, context)
        if handled:
            return
    
    await query.answer()
    
    if query.data == "refresh_price":
        token_data = await fetch_token_data()
        
        if token_data:
            price_usd = token_data.get("priceUsd", "N/A")
            change_h1 = token_data.get("priceChange", {}).get("h1", "N/A")
            change_h6 = token_data.get("priceChange", {}).get("h6", "N/A")
            change_h24 = token_data.get("priceChange", {}).get("h24", "N/A")
            volume_h24 = token_data.get("volume", {}).get("h24", "N/A")
            liquidity = token_data.get("liquidity", {}).get("usd", "N/A")
            market_cap = token_data.get("fdv", "N/A")
            txns_h24 = token_data.get("txns", {}).get("h24", {})
            buys_h24 = txns_h24.get("buys", "N/A")
            sells_h24 = txns_h24.get("sells", "N/A")
            
            try:
                last_price = float(price_usd)
            except:
                pass
            
            def format_change(change):
                try:
                    c = float(change)
                    emoji = "🟢" if c >= 0 else "🔴"
                    return f"{emoji} {c:+.2f}%"
                except:
                    return "N/A"
            
            msg = (
                f"💰 *$GANG Price*\n\n"
                f"💵 *Price:* ${price_usd}\n\n"
                f"📈 *Price Changes:*\n"
                f"   • 1H: {format_change(change_h1)}\n"
                f"   • 6H: {format_change(change_h6)}\n"
                f"   • 24H: {format_change(change_h24)}\n\n"
                f"📊 *Market Data:*\n"
                f"   • Volume 24H: {format_number(volume_h24)}\n"
                f"   • Liquidity: {format_number(liquidity)}\n"
                f"   • Market Cap: {format_number(market_cap)}\n\n"
                f"🔄 *24H Transactions:*\n"
                f"   • Buys: {buys_h24} | Sells: {sells_h24}\n\n"
                f"🕐 Updated: {datetime.now(timezone.utc).strftime('%H:%M:%S UTC')}"
            )
        else:
            msg = f"💰 *$GANG Token*\n\n⚠️ Unable to fetch price data\n[View Chart]({DEXSCREENER})"
        
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=price_popup_keyboard())
    
    elif query.data == "set_alert":
        user_alerts = price_alerts.get(user_id, {})
        alert_status = ""
        if user_alerts:
            if user_alerts.get("above"):
                alert_status += f"🔔 Alert when above: ${user_alerts['above']:.6f}\n"
            if user_alerts.get("below"):
                alert_status += f"🔔 Alert when below: ${user_alerts['below']:.6f}\n"
        else:
            alert_status = "No alerts set"
        
        current_price = "N/A"
        if last_price:
            current_price = f"${last_price:.6f}"
        
        msg = (
            f"⚠️ *Price Alerts*\n\n"
            f"💵 Current Price: {current_price}\n\n"
            f"*Your Alerts:*\n{alert_status}\n\n"
            "Use buttons below to set alerts:"
        )
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=alert_keyboard())
    
    elif query.data == "alert_above":
        if last_price:
            alert_price = last_price * 1.1  # 10% above current
            if user_id not in price_alerts:
                price_alerts[user_id] = {}
            price_alerts[user_id]["above"] = alert_price
            await query.edit_message_text(
                f"✅ Alert set!\n\nYou'll be notified when $GANG goes above ${alert_price:.6f} (+10% from current)",
                reply_markup=alert_keyboard()
            )
        else:
            await query.edit_message_text("⚠️ Unable to set alert - price data unavailable", reply_markup=alert_keyboard())
    
    elif query.data == "alert_below":
        if last_price:
            alert_price = last_price * 0.9  # 10% below current
            if user_id not in price_alerts:
                price_alerts[user_id] = {}
            price_alerts[user_id]["below"] = alert_price
            await query.edit_message_text(
                f"✅ Alert set!\n\nYou'll be notified when $GANG goes below ${alert_price:.6f} (-10% from current)",
                reply_markup=alert_keyboard()
            )
        else:
            await query.edit_message_text("⚠️ Unable to set alert - price data unavailable", reply_markup=alert_keyboard())
    
    elif query.data == "clear_alerts":
        if user_id in price_alerts:
            del price_alerts[user_id]
        await query.edit_message_text("✅ All your price alerts have been cleared!", reply_markup=alert_keyboard())

    elif query.data == "menu_back":
        msg = (
            "🔫 *$GANG - Cronos Gangsters*\n\n"
            "The Most Gangster DEX on Cronos!\n\n"
            "👇 *Tap any button below to explore!*"
        )
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=main_keyboard())

    elif query.data == "menu_farms":
        msg = "🌾 *GANGSTER FARMS*\n\nStake LP tokens to earn $GANG rewards!\n\n"
        for farm in FARMS:
            msg += f"*{farm['name']}*\n   Alloc: {farm['allocation']}"
            if 'tvl' in farm:
                msg += f" | TVL: {farm['tvl']}"
            msg += "\n\n"
        msg += f"🔗 *MasterChef:*\n`{CONTRACTS['MASTERCHEF']}`"
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🌾 Open Farms", url=f"{DEX_LINK}#farms")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_vaults":
        msg = "🏦 *AUTO-COMPOUND VAULTS*\n\nDeposit and let us compound for you!\n\n"
        for vault in VAULTS:
            msg += f"*{vault['name']}*\n   APY: {vault['apy']} | {vault['strategy']}\n\n"
        msg += "💡 Deposit LP → vault auto-compounds → position grows!"
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🏦 Open Vaults", url=f"{DEX_LINK}#vaults")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_staking":
        msg = "🔒 *$GANG STAKING VAULT*\n\nLock $GANG for boosted rewards!\n\n*Tiers:*\n"
        for tier in STAKING_TIERS:
            emoji = "🔥" if tier['multiplier'] == "MAX" else "✓"
            msg += f"• *{tier['period']}*: {tier['apy']} APY ({tier['multiplier']}) {emoji}\n"
        msg += f"\n🎴 *+20% NFT Holder Boost!*\n⚠️ Early Exit Penalty: *25%*\n\n🔗 `{CONTRACTS['STAKING']}`"
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🔒 Stake $GANG", url=f"{DEX_LINK}#staking"),
             InlineKeyboardButton("🎴 NFT Boost", url=f"{DEX_LINK}#nfts")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_launchpad":
        msg = "🚀 *GANGSTER LAUNCHPAD*\n\nGet early access to new tokens!\n\n*Staking Tiers:*\n"
        for tier in LAUNCHPAD_TIERS:
            emoji = "💎" if tier['tier'] == "Diamond" else "🥇" if tier['tier'] == "Gold" else "🥈" if tier['tier'] == "Silver" else "🥉"
            msg += f"{emoji} *{tier['tier']}*: Stake {tier['stake']} → {tier['allocation']} alloc\n"
        msg += "\n💰 *Platform Fee:* 3% of raised funds"
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🚀 Open Launchpad", url=f"{DEX_LINK}#launchpad")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_locker":
        msg = (
            "🔐 *LP TOKEN LOCKER*\n\n"
            "Lock your LP tokens to build trust!\n\n"
            "*Features:*\n"
            "• Lock any LP token\n"
            "• Choose lock duration\n"
            "• Option to burn LP (permanent)\n"
            "• Verified on DexScreener\n"
            "• Public lock verification\n\n"
            f"💰 *Lock Fee:* {LOCKER_INFO['lock_fee']} per lock\n\n"
            "✓ Prevents rug pulls\n"
            "✓ Builds investor confidence"
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🔐 Open Locker", url=f"{DEX_LINK}#locker"),
             InlineKeyboardButton("🔥 Burn LP", url=f"{DEX_LINK}#locker")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_sniper":
        features_list = "\n".join([f"   ✓ {f}" for f in SNIPER_INFO['features']])
        msg = (
            f"🎯 *GANGSTER SNIPER BOT*\n\n"
            f"Trade faster than everyone else!\n\n"
            f"💰 *Trading Fee:* {SNIPER_INFO['fee']} per trade\n\n"
            f"*Features:*\n{features_list}\n\n"
            f"⚠️ *Anti-Rug Protection Active!*"
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🎯 Open Sniper", url=f"{DEX_LINK}#sniper")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_nft":
        msg = (
            "🎴 *CRONOS GANGSTERS NFTs*\n\n"
            "500 Unique Gangsters on Cronos!\n\n"
            f"💰 *Mint Price:* {NFT_INFO['mint_price']}\n"
            f"📦 *Total Supply:* {NFT_INFO['total_supply']}\n"
            f"⚡ *Utility:* {NFT_INFO['boost']}\n\n"
            "*Rarity:* Legendary 2.4% | Epic 6% | Rare 31%\n\n"
            f"🔗 `{NFT_INFO['contract']}`"
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🎴 Mint NFT", url=f"{DEX_LINK}#nfts"),
             InlineKeyboardButton("🖼 Gallery", url=f"{DEX_LINK}#nfts")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_referral":
        msg = (
            "👥 *INVITE THE FAMILY*\n\n"
            "Share your link. Earn *5%* in $GANG\n"
            "when your crew swaps!\n\n"
            "*How It Works:*\n"
            "1️⃣ Connect wallet on cronosgangsters.com\n"
            "2️⃣ Copy your unique invite link\n"
            "3️⃣ Share with friends\n"
            "4️⃣ Earn 5% of swap value in $GANG\n\n"
            f"🔗 `{CONTRACTS['REFERRAL']}`"
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🔗 Get Referral Link", url=f"{DEX_LINK}#referral")],
            [InlineKeyboardButton("📢 Share on Telegram", url=f"https://t.me/share/url?url={DEX_LINK}"),
             InlineKeyboardButton("🐦 Share on X", url=f"https://twitter.com/intent/tweet?text=Join%20Cronos%20Gangsters!%20{DEX_LINK}")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_bridge":
        chains_list = ", ".join(BRIDGE_INFO['supported'][:5]) + "..."
        msg = (
            f"🌉 *CROSS-CHAIN BRIDGE*\n\n"
            f"Bridge across {BRIDGE_INFO['chains']} chains!\n"
            f"Powered by {BRIDGE_INFO['provider']}\n\n"
            f"*Chains:* {chains_list}\n\n"
            f"💡 Best rates aggregated automatically"
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🌉 Open Bridge", url=f"{DEX_LINK}#bridge")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_lottery":
        msg = (
            "🎰 *GANGSTER LOTTERY*\n\n"
            f"🎟 *Ticket:* {LOTTERY_INFO['ticket_price']}\n"
            f"🏆 *Pool Fee:* {LOTTERY_INFO['pool_fee']}\n"
            f"⏰ *Draw:* {LOTTERY_INFO['draw_frequency']}\n\n"
            "Winner takes 90% of the pot!\n"
            "🍀 Good luck, gangster!"
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🎟 Buy Tickets", url=f"{DEX_LINK}#lottery")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_create":
        msg = (
            "🛠 *TOKEN CREATOR*\n\n"
            "Deploy your own token on Cronos!\n\n"
            f"🟢 *BASIC* — {TOKEN_CREATOR['basic']['price']}\n"
            f"   {TOKEN_CREATOR['basic']['features']}\n\n"
            f"🟡 *PREMIUM* — {TOKEN_CREATOR['premium']['price']}\n"
            f"   {TOKEN_CREATOR['premium']['features']}\n\n"
            f"💎 *DIAMOND* — {TOKEN_CREATOR['diamond']['price']}\n"
            f"   {TOKEN_CREATOR['diamond']['features']}"
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🛠 Create Token", url=f"{DEX_LINK}#create")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_marketplace":
        msg = (
            "🏪 *NFT MARKETPLACE*\n\n"
            "Buy & sell any NFT on Cronos!\n\n"
            f"💰 *Trading Fee:* {MARKETPLACE_INFO['fee']}\n\n"
            "*Features:*\n"
            "• List any Cronos NFT\n"
            "• Auto-detect collections\n"
            "• Instant settlements\n"
            "• No listing fees\n"
            "• Royalties supported"
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🏪 Browse NFTs", url=f"{DEX_LINK}#marketplace")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_mining":
        msg = (
            "⛏ *$GANG MINING HUB*\n"
            "━━━━━━━━━━━━━━━━━━━━━\n\n"
            "🔥 *EARN REAL $GANG TOKENS FOR FREE!*\n\n"
            "━━━ *HOW IT WORKS* ━━━\n\n"
            "1️⃣ *TAP TO MINE* — Earn 5 $GANG every day just by tapping a button. It's free!\n\n"
            "2️⃣ *PLAY & MULTIPLY* — Use your mined $GANG in 19 casino games, racing, lottery & leverage trading to grow your balance!\n\n"
            "3️⃣ *REACH 100 $GANG* — Once your balance hits 100, the WITHDRAW button unlocks\n\n"
            "4️⃣ *WITHDRAW REAL TOKENS* — Your virtual balance converts to REAL $GANG tokens sent directly to your wallet! (5% burn fee)\n\n"
            "━━━ *ALL GAMES* ━━━\n\n"
            "🎰 Slots • Crash • Roulette\n"
            "🃏 Blackjack • Poker • Baccarat\n"
            "🎲 Dice • Coin Flip • Hi-Lo\n"
            "✊ Rock Paper Scissors\n"
            "🏇 Horse Racing • Car Racing\n"
            "🎱 Plinko • Mines • Wheel\n"
            "🎯 Keno • Scratch Cards • Limbo\n\n"
            "━━━ *BONUSES* ━━━\n\n"
            "👥 *Referral:* Earn 10% of what your friends mine!\n"
            "🏆 *VIP Tiers:* Bronze (2x) → Silver (3x) → Gold (5x) mining multiplier\n"
            "🎫 *Lottery:* Win the jackpot!\n"
            "💎 *Mystery Boxes:* Rare rewards\n"
            "⚔️ *Tournaments:* Compete for prize pools\n"
            "📈 *Staking:* Lock $GANG for bonus yields\n\n"
            "💰 *25,000 $GANG in the reward pool!*\n\n"
            "👇 *Start mining NOW!*"
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("⛏ START MINING NOW", url=f"{DEX_LINK}/mining.html")],
            [InlineKeyboardButton("👥 Get Referral Link", url=f"{DEX_LINK}/mining.html")],
            [InlineKeyboardButton("⚡ Leverage Trading", callback_data="menu_trading")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_trading":
        msg = (
            "⚡ *LEVERAGE TRADING*\n"
            "━━━━━━━━━━━━━━━━━━━━━\n\n"
            "📈 *Trade crypto with up to 100x LEVERAGE!*\n\n"
            "━━━ *HOW IT WORKS* ━━━\n\n"
            "1️⃣ *MINE $GANG* — First earn $GANG from the Mining Hub (free daily mining!)\n\n"
            "2️⃣ *PICK A PAIR* — Choose from 8 major crypto pairs. Each has a LIVE chart with real prices!\n\n"
            "3️⃣ *GO LONG OR SHORT*\n"
            "   • LONG = You think the price goes UP 📈\n"
            "   • SHORT = You think the price goes DOWN 📉\n\n"
            "4️⃣ *SET YOUR LEVERAGE* — 10x, 25x, 50x, or 100x\n"
            "   • 10x = Your gains (and losses) are multiplied by 10\n"
            "   • 100x = MAXIMUM risk & reward!\n\n"
            "5️⃣ *ENTER YOUR BET* — How much $GANG you want to risk\n\n"
            "6️⃣ *CLOSE WHEN READY* — Close your position anytime to lock in profits (or cut losses)\n\n"
            "━━━ *EXAMPLE* ━━━\n\n"
            "You bet 50 $GANG on BTC LONG at 25x leverage:\n"
            "• If BTC goes up 4% → You make +50 $GANG profit! (4% × 25 = 100%)\n"
            "• If BTC goes down 4% → You lose your 50 $GANG (liquidated)\n\n"
            "━━━ *AVAILABLE PAIRS* ━━━\n\n"
            "₿ BTC/USD | ⟠ ETH/USD | 🔷 CRO/USD\n"
            "◎ SOL/USD | 🐕 DOGE/USD | 🐸 PEPE/USD\n"
            "💲 XRP/USD | 🦊 SHIB/USD\n\n"
            "📊 *Live TradingView charts for every pair!*\n"
            "💰 *0.1% trading fee per position*\n\n"
            "⚠️ *High leverage = high risk. Trade smart!*\n\n"
            "👇 *Start trading NOW!*"
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("⚡ START TRADING NOW", url=f"{DEX_LINK}/trading.html")],
            [InlineKeyboardButton("⛏ Mine $GANG First", callback_data="menu_mining")],
            [InlineKeyboardButton("📊 View Chart", url=DEXSCREENER)],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_dashboard":
        msg = (
            "🤖 *BOT DASHBOARD*\n\n"
            "Control the Cronos Gangsters Bot!\n\n"
            "*Features:*\n"
            "• Start / Stop the bot\n"
            "• Live $GANG price & stats\n"
            "• DexScreener integration\n"
            "• Real-time monitoring\n\n"
            "Only accessible to the owner."
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🤖 Open Dashboard", url=f"{DEX_LINK}/dashboard.html")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_deployfarms":
        msg = (
            "🌱 *DEPLOY NEW FARMS*\n\n"
            "1-Click LP Pair Creation & MasterChef Registration!\n\n"
            "*Available Farms:*\n"
            "• XRP / GANG\n"
            "• PEPE / GANG\n"
            "• DOGE / GANG\n\n"
            "*Steps:*\n"
            "1. Create LP pair on VVS Factory\n"
            "2. Register on MasterChef\n"
            "3. Farm is live!\n\n"
            "Owner only."
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("🌱 Deploy Farms", url=f"{DEX_LINK}/deploy-farms.html")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)

    elif query.data == "menu_deploy":
        msg = (
            "📜 *DEPLOY $GANG REWARDS*\n\n"
            "Deploy a GANGRewards smart contract.\n\n"
            "*What it does:*\n"
            "• Holds $GANG tokens for mining rewards\n"
            "• sendReward — distribute to users\n"
            "• withdrawAll — owner withdraws balance\n"
            "• getBalance — check contract balance\n\n"
            "⚠️ Only deploy once! Don't create duplicates."
        )
        kb = InlineKeyboardMarkup([
            [InlineKeyboardButton("📜 Deploy Contract", url=f"{DEX_LINK}/deploy.html")],
            [InlineKeyboardButton("🔙 Back to Menu", callback_data="menu_back")],
        ])
        await query.edit_message_text(msg, parse_mode="Markdown", reply_markup=kb)


# ===== ADMIN COMMANDS =====

async def is_admin(update: Update, context: ContextTypes.DEFAULT_TYPE) -> bool:
    """Check if user is admin"""
    user_id = update.effective_user.id
    if user_id in ADMIN_IDS:
        return True
    
    # Also check if user is a Telegram group admin
    try:
        chat_member = await context.bot.get_chat_member(update.effective_chat.id, user_id)
        return chat_member.status in ["administrator", "creator"]
    except:
        return False


async def ban(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Ban a user (reply to their message)"""
    if not await is_admin(update, context):
        await update.message.reply_text("⛔ You don't have permission to use this command.")
        return
    
    if not update.message.reply_to_message:
        await update.message.reply_text("⚠️ Reply to a message to ban the user.")
        return
    
    user_to_ban = update.message.reply_to_message.from_user
    try:
        await context.bot.ban_chat_member(update.effective_chat.id, user_to_ban.id)
        await update.message.reply_text(f"🔨 {user_to_ban.first_name} has been banned!")
    except Exception as e:
        logger.error(f"Ban error: {e}")
        await update.message.reply_text(f"❌ Could not ban user: {e}")


async def unban(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Unban a user by ID"""
    if not await is_admin(update, context):
        await update.message.reply_text("⛔ You don't have permission to use this command.")
        return
    
    if not context.args:
        await update.message.reply_text("⚠️ Usage: /unban <user_id>")
        return
    
    try:
        user_id = int(context.args[0])
        await context.bot.unban_chat_member(update.effective_chat.id, user_id)
        await update.message.reply_text(f"✅ User {user_id} has been unbanned!")
    except ValueError:
        await update.message.reply_text("⚠️ Please provide a valid user ID.")
    except Exception as e:
        logger.error(f"Unban error: {e}")
        await update.message.reply_text(f"❌ Could not unban user: {e}")


async def mute(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Mute a user (reply to their message)"""
    if not await is_admin(update, context):
        await update.message.reply_text("⛔ You don't have permission to use this command.")
        return
    
    if not update.message.reply_to_message:
        await update.message.reply_text("⚠️ Reply to a message to mute the user.")
        return
    
    user_to_mute = update.message.reply_to_message.from_user
    try:
        await context.bot.restrict_chat_member(
            update.effective_chat.id,
            user_to_mute.id,
            permissions=ChatPermissions(can_send_messages=False)
        )
        await update.message.reply_text(f"🔇 {user_to_mute.first_name} has been muted!")
    except Exception as e:
        logger.error(f"Mute error: {e}")
        await update.message.reply_text(f"❌ Could not mute user: {e}")


async def unmute(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Unmute a user (reply to their message)"""
    if not await is_admin(update, context):
        await update.message.reply_text("⛔ You don't have permission to use this command.")
        return
    
    if not update.message.reply_to_message:
        await update.message.reply_text("⚠️ Reply to a message to unmute the user.")
        return
    
    user_to_unmute = update.message.reply_to_message.from_user
    try:
        await context.bot.restrict_chat_member(
            update.effective_chat.id,
            user_to_unmute.id,
            permissions=ChatPermissions(
                can_send_messages=True,
                can_send_other_messages=True,
                can_add_web_page_previews=True
            )
        )
        await update.message.reply_text(f"🔊 {user_to_unmute.first_name} has been unmuted!")
    except Exception as e:
        logger.error(f"Unmute error: {e}")
        await update.message.reply_text(f"❌ Could not unmute user: {e}")


async def kick(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Kick a user (reply to their message)"""
    if not await is_admin(update, context):
        await update.message.reply_text("⛔ You don't have permission to use this command.")
        return
    
    if not update.message.reply_to_message:
        await update.message.reply_text("⚠️ Reply to a message to kick the user.")
        return
    
    user_to_kick = update.message.reply_to_message.from_user
    try:
        await context.bot.ban_chat_member(update.effective_chat.id, user_to_kick.id)
        await context.bot.unban_chat_member(update.effective_chat.id, user_to_kick.id)
        await update.message.reply_text(f"👢 {user_to_kick.first_name} has been kicked!")
    except Exception as e:
        logger.error(f"Kick error: {e}")
        await update.message.reply_text(f"❌ Could not kick user: {e}")


# Warning system
user_warnings = {}  # user_id: warning_count

async def warn(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Warn a user (reply to their message) - 3 warnings = ban"""
    if not await is_admin(update, context):
        await update.message.reply_text("⛔ You don't have permission to use this command.")
        return
    
    if not update.message.reply_to_message:
        await update.message.reply_text("⚠️ Reply to a message to warn the user.")
        return
    
    user_to_warn = update.message.reply_to_message.from_user
    user_id = user_to_warn.id
    
    if user_id not in user_warnings:
        user_warnings[user_id] = 0
    
    user_warnings[user_id] += 1
    warning_count = user_warnings[user_id]
    
    if warning_count >= 3:
        try:
            await context.bot.ban_chat_member(update.effective_chat.id, user_id)
            await update.message.reply_text(
                f"🔨 {user_to_warn.first_name} has been banned for repeated spam ({warning_count}/3)."
            )
            del user_warnings[user_id]
        except Exception as e:
            logger.error(f"Auto-ban error: {e}")
            await update.message.reply_text(f"❌ Could not ban user: {e}")
    else:
        await update.message.reply_text(
            f"⚠️ {user_to_warn.first_name} has been warned ({warning_count}/3).\n"
            f"3 warnings = automatic ban!"
        )


async def post_price_update(context: ContextTypes.DEFAULT_TYPE):
    """Periodic price update to group"""
    global last_price
    
    try:
        token_data = await fetch_token_data()
        
        if token_data:
            price_usd = token_data.get("priceUsd", "N/A")
            change_h24 = token_data.get("priceChange", {}).get("h24", "N/A")
            volume_h24 = token_data.get("volume", {}).get("h24", "N/A")
            
            try:
                current_price = float(price_usd)
                last_price = current_price
                
                # Check price alerts
                for user_id, alerts in list(price_alerts.items()):
                    try:
                        if alerts.get("above") and current_price >= alerts["above"]:
                            await context.bot.send_message(
                                chat_id=user_id,
                                text=f"🚀 *Price Alert!*\n\n$GANG is now ${price_usd}\n(Above your target of ${alerts['above']:.6f})",
                                parse_mode="Markdown"
                            )
                            del price_alerts[user_id]["above"]
                        
                        if alerts.get("below") and current_price <= alerts["below"]:
                            await context.bot.send_message(
                                chat_id=user_id,
                                text=f"📉 *Price Alert!*\n\n$GANG is now ${price_usd}\n(Below your target of ${alerts['below']:.6f})",
                                parse_mode="Markdown"
                            )
                            del price_alerts[user_id]["below"]
                    except Exception as e:
                        logger.error(f"Alert notification error for user {user_id}: {e}")
            except:
                pass
            
            # Format change emoji
            try:
                change_val = float(change_h24)
                change_emoji = "🟢" if change_val >= 0 else "🔴"
                change_str = f"{change_emoji} {change_val:+.2f}%"
            except:
                change_str = "N/A"
            
            msg = (
                f"💰 *$GANG Price Update*\n\n"
                f"💵 Price: ${price_usd}\n"
                f"📈 24h Change: {change_str}\n"
                f"📊 24h Volume: {format_number(volume_h24)}\n\n"
                f"[Buy $GANG]({DEX_LINK}) | [Chart]({DEXSCREENER})"
            )
            
            await context.bot.send_message(
                chat_id=GROUP_ID,
                text=msg,
                parse_mode="Markdown",
                reply_markup=main_keyboard()
            )
    except Exception as e:
        logger.error(f"Price update error: {e}")


async def error_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle errors"""
    logger.error(f"Exception while handling update: {context.error}")


def main():
    """Main function to run the bot"""
    if not BOT_TOKEN:
        logger.error("TELEGRAM_BOT_TOKEN environment variable not set!")
        return
    
    logger.info("Starting Cronos Gangsters Bot...")
    
    app = Application.builder().token(BOT_TOKEN).build()
    
    # Add command handlers
    app.add_handler(CommandHandler("start", start))
    app.add_handler(CommandHandler("help", help_command))
    app.add_handler(CommandHandler("contract", contract))
    app.add_handler(CommandHandler("buy", buy))
    app.add_handler(CommandHandler("website", website))
    app.add_handler(CommandHandler("socials", socials))
    app.add_handler(CommandHandler("price", price))
    app.add_handler(CommandHandler("stats", stats))
    app.add_handler(CommandHandler("shill", shill))
    app.add_handler(CommandHandler("alert", alert))
    app.add_handler(CommandHandler("farms", farms))
    app.add_handler(CommandHandler("staking", staking))
    app.add_handler(CommandHandler("nft", nft))
    app.add_handler(CommandHandler("referral", referral))
    
    # NEW: 8 additional commands to match website
    app.add_handler(CommandHandler("vaults", vaults))
    app.add_handler(CommandHandler("launchpad", launchpad))
    app.add_handler(CommandHandler("locker", locker))
    app.add_handler(CommandHandler("lottery", lottery))
    app.add_handler(CommandHandler("sniper", sniper))
    app.add_handler(CommandHandler("bridge", bridge))
    app.add_handler(CommandHandler("create", create))
    app.add_handler(CommandHandler("marketplace", marketplace))
    app.add_handler(CommandHandler("mining", mining))
    app.add_handler(CommandHandler("trading", trading))
    
    # Admin commands
    app.add_handler(CommandHandler("ban", ban))
    app.add_handler(CommandHandler("unban", unban))
    app.add_handler(CommandHandler("mute", mute))
    app.add_handler(CommandHandler("unmute", unmute))
    app.add_handler(CommandHandler("kick", kick))
    app.add_handler(CommandHandler("warn", warn))
    
    # Callback handlers for buttons
    app.add_handler(CallbackQueryHandler(callback_handler))
    
    # Message handlers - Anti-scam filter for all text messages
    # No message filter - removed anti-scam
    app.add_handler(MessageHandler(filters.StatusUpdate.NEW_CHAT_MEMBERS, welcome_new_member))
    
    # Error handler
    app.add_error_handler(error_handler)
    
    # Set up job queue for periodic price updates
    job_queue = app.job_queue
    job_queue.run_repeating(post_price_update, interval=PRICE_UPDATE_INTERVAL, first=10)
    
    logger.info("Bot started successfully!")
    app.run_polling(drop_pending_updates=True)


if __name__ == "__main__":
    main()
