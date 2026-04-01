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
TWITTER = os.environ.get("TWITTER", "https://x.com/CronosGangstersDEX")
TELEGRAM_GROUP = os.environ.get("TELEGRAM_GROUP", "https://t.me/+DrWDScTEiLg1ZGQ0")
GROUP_ID = int(os.environ.get("GROUP_ID", "-1003284963991"))
DEXSCREENER = f"https://dexscreener.com/cronos/{CONTRACT}"
EXPLORER = f"https://explorer.cronos.org/token/{CONTRACT}"
PRICE_UPDATE_INTERVAL = int(os.environ.get("PRICE_UPDATE_INTERVAL", "300"))  # 5 minutes default

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
    {"name": "GANG / VVS", "apr": "~500%", "allocation": "10%", "pid": 0},
    {"name": "CRO / GANG", "apr": "~500%", "tvl": "$1.3K", "allocation": "40%", "pid": 1},
    {"name": "GANG / USDC", "apr": "~500%", "tvl": "$201", "allocation": "30%", "pid": 2},
    {"name": "GANG Staking", "apr": "~500%", "allocation": "20%", "pid": 3},
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

# Admin user IDs (add your Telegram user IDs here)
ADMIN_IDS = set(map(int, os.environ.get("ADMIN_IDS", "").split(",") if os.environ.get("ADMIN_IDS") else []))

# Price alert thresholds
price_alerts = {}  # user_id: {"above": price, "below": price}
last_price = None

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
    """Main inline keyboard for bot messages"""
    return InlineKeyboardMarkup([
        [InlineKeyboardButton("💰 Buy $GANG", url=DEX_LINK),
         InlineKeyboardButton("📊 Chart", url=DEXSCREENER)],
        [InlineKeyboardButton("🌐 Website", url=DEX_LINK),
         InlineKeyboardButton("🐦 Twitter", url=TWITTER)],
        [InlineKeyboardButton("💬 Telegram", url=TELEGRAM_GROUP),
         InlineKeyboardButton("🔍 Explorer", url=EXPLORER)],
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
        "🔫 *$GANG - Cronos Gangsters*\n\n"
        "The most gangster DEX on Cronos!\n\n"
        f"📋 *Contract:*\n`{CONTRACT}`\n\n"
        "💰 *Features:*\n"
        "• Swap - Farm - Stake\n"
        "• CRO/GANG Farm — 1,883% APR\n"
        "• GANG/USDC Farm — 10,000%+ APR\n"
        "• GANG Staking — daily rewards\n\n"
        "🎴 *500 Unique NFTs* — Mint for 50 CRO\n\n"
        "Join the gang! The streets are ours. 🤝"
    )
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=main_keyboard())


async def help_command(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle /help command - list all available commands"""
    is_admin = update.effective_user.id in ADMIN_IDS
    
    msg = (
        "📖 *Cronos Gangsters Bot Commands*\n\n"
        "*General Commands:*\n"
        "• /start - Welcome message & info\n"
        "• /help - Show this help menu\n"
        "• /price - Current $GANG price & stats\n"
        "• /contract - Token contract address\n"
        "• /buy - How to buy $GANG\n"
        "• /website - DEX website link\n"
        "• /socials - Social media links\n"
        "• /shill - Shareable promo message\n"
        "• /stats - Detailed token statistics\n"
        "• /alert - Set price alerts\n"
        "• /farms - View yield farms & APRs\n"
        "• /staking - Staking vault info\n"
        "• /nft - NFT collection info\n"
        "• /referral - Referral program info\n"
    )
    
    if is_admin:
        msg += (
            "\n*Admin Commands:*\n"
            "• /ban - Reply to ban a user\n"
            "• /unban - Unban a user by ID\n"
            "• /mute - Reply to mute a user\n"
            "• /unmute - Reply to unmute a user\n"
            "• /warn - Reply to warn a user\n"
            "• /kick - Reply to kick a user\n"
        )
    
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
        f"The most gangster DEX on Cronos!{price_line}\n"
        "Swap - Farm - Stake\n\n"
        f"📋 Contract:\n`{CONTRACT}`\n\n"
        "Join the gang! The streets are ours. 🤝\n\n"
        f"🌐 Website: {DEX_LINK}\n"
        f"📊 Chart: {DEXSCREENER}\n"
        f"💬 Telegram: {TELEGRAM_GROUP}"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("💰 Buy $GANG", url=DEX_LINK),
         InlineKeyboardButton("📊 Chart", url=DEXSCREENER)],
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
        [InlineKeyboardButton("🌾 Open Farms", url=DEX_LINK),
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
        [InlineKeyboardButton("🔒 Stake $GANG", url=DEX_LINK),
         InlineKeyboardButton("🎴 Get NFT Boost", url=DEX_LINK)],
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
        [InlineKeyboardButton("🎴 Mint NFT", url=f"{DEX_LINK}/mint-nft.html"),
         InlineKeyboardButton("🖼 View Gallery", url=DEX_LINK)],
        [InlineKeyboardButton("🔒 Stake with NFT Boost", url=DEX_LINK)],
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
        f"[🔗 Get Your Referral Link]({DEX_LINK})"
    )
    
    keyboard = InlineKeyboardMarkup([
        [InlineKeyboardButton("🔗 Get Referral Link", url=DEX_LINK)],
        [InlineKeyboardButton("📢 Share on Telegram", url=f"https://t.me/share/url?url={DEX_LINK}"),
         InlineKeyboardButton("🐦 Share on X", url=f"https://twitter.com/intent/tweet?text=Join%20Cronos%20Gangsters%20DEX!%20{DEX_LINK}")],
    ])
    
    await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=keyboard)




async def callback_handler(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Handle button callbacks"""
    global last_price
    query = update.callback_query
    await query.answer()
    
    user_id = update.effective_user.id
    
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


async def welcome_new_member(update: Update, context: ContextTypes.DEFAULT_TYPE):
    """Welcome new members joining the group"""
    for member in update.message.new_chat_members:
        if member.is_bot:
            continue
        name = member.first_name or "Boss"
        msg = (
            f"🔫 *Welcome to the family, {name}!*\n\n"
            "You've just joined the most ruthless DEX on Cronos.\n\n"
            f"💰 Buy $GANG: {DEX_LINK}\n"
            f"📋 Contract: `{CONTRACT}`\n\n"
            "GANG or nothing! 🤝"
        )
        await update.message.reply_text(msg, parse_mode="Markdown", reply_markup=main_keyboard())


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
    
    # Admin commands
    app.add_handler(CommandHandler("ban", ban))
    app.add_handler(CommandHandler("unban", unban))
    app.add_handler(CommandHandler("mute", mute))
    app.add_handler(CommandHandler("unmute", unmute))
    app.add_handler(CommandHandler("kick", kick))
    app.add_handler(CommandHandler("warn", warn))
    
    # Callback handlers for buttons
    app.add_handler(CallbackQueryHandler(callback_handler))
    
    # Message handlers
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
