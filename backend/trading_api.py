# Real Leverage Trading API
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
import aiohttp
import asyncio

router = APIRouter(prefix="/trading", tags=["trading"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Trading pairs with Dexscreener IDs
TRADING_PAIRS = {
    "GANG": {
        "name": "GANG/USD",
        "symbol": "GANG",
        "icon": "💎",
        "dexscreener": "cronos/0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF",
        "coingecko": None
    },
    "BTC": {
        "name": "BTC/USD", 
        "symbol": "BTC",
        "icon": "₿",
        "dexscreener": None,
        "coingecko": "bitcoin"
    },
    "ETH": {
        "name": "ETH/USD",
        "symbol": "ETH", 
        "icon": "⟠",
        "dexscreener": None,
        "coingecko": "ethereum"
    },
    "CRO": {
        "name": "CRO/USD",
        "symbol": "CRO",
        "icon": "🔷",
        "dexscreener": None,
        "coingecko": "crypto-com-chain"
    },
    "SOL": {
        "name": "SOL/USD",
        "symbol": "SOL",
        "icon": "◎",
        "dexscreener": None,
        "coingecko": "solana"
    },
    "DOGE": {
        "name": "DOGE/USD",
        "symbol": "DOGE",
        "icon": "🐕",
        "dexscreener": None,
        "coingecko": "dogecoin"
    },
    "PEPE": {
        "name": "PEPE/USD",
        "symbol": "PEPE",
        "icon": "🐸",
        "dexscreener": None,
        "coingecko": "pepe"
    },
    "SHIB": {
        "name": "SHIB/USD",
        "symbol": "SHIB",
        "icon": "🦊",
        "dexscreener": None,
        "coingecko": "shiba-inu"
    },
}

# Config
TRADING_FEE = 0.001  # 0.1% per trade
LEVERAGE_OPTIONS = [10, 25, 50, 100]
MIN_POSITION = 5  # Minimum 5 $GANG

class OpenPositionRequest(BaseModel):
    wallet_address: str
    pair: str
    direction: str  # "long" or "short"
    leverage: int
    amount: float  # in $GANG

class ClosePositionRequest(BaseModel):
    wallet_address: str
    position_id: str

class WalletRequest(BaseModel):
    wallet_address: str

# Price cache
price_cache = {}
cache_time = {}

async def get_price(pair: str) -> Optional[float]:
    """Get live price for a trading pair"""
    global price_cache, cache_time
    
    # Check cache (5 second cache)
    if pair in price_cache and pair in cache_time:
        if (datetime.now() - cache_time[pair]).seconds < 5:
            return price_cache[pair]
    
    pair_info = TRADING_PAIRS.get(pair)
    if not pair_info:
        return None
    
    try:
        async with aiohttp.ClientSession() as session:
            if pair_info.get("dexscreener"):
                # Use Dexscreener for GANG
                url = f"https://api.dexscreener.com/latest/dex/tokens/{pair_info['dexscreener'].split('/')[-1]}"
                async with session.get(url, timeout=10) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        if data.get("pairs") and len(data["pairs"]) > 0:
                            price = float(data["pairs"][0].get("priceUsd", 0))
                            price_cache[pair] = price
                            cache_time[pair] = datetime.now()
                            return price
            
            if pair_info.get("coingecko"):
                # Use CoinGecko for other tokens
                url = f"https://api.coingecko.com/api/v3/simple/price?ids={pair_info['coingecko']}&vs_currencies=usd"
                headers = {"Accept": "application/json"}
                async with session.get(url, timeout=10, headers=headers) as resp:
                    if resp.status == 200:
                        data = await resp.json()
                        if pair_info['coingecko'] in data:
                            price = float(data[pair_info['coingecko']]['usd'])
                            price_cache[pair] = price
                            cache_time[pair] = datetime.now()
                            return price
                    else:
                        # Fallback prices if CoinGecko fails
                        fallback = {
                            "BTC": 97000, "ETH": 3400, "CRO": 0.11, 
                            "SOL": 190, "DOGE": 0.32, "PEPE": 0.000018, "SHIB": 0.000022
                        }
                        if pair in fallback:
                            price_cache[pair] = fallback[pair]
                            cache_time[pair] = datetime.now()
                            return fallback[pair]
    except Exception as e:
        print(f"Price fetch error for {pair}: {e}")
    
    return price_cache.get(pair)

async def get_user_balance(wallet: str) -> float:
    """Get user's $GANG balance"""
    miner = await db.miners.find_one({"wallet_address": wallet.lower()}, {"_id": 0})
    return miner["balance"] if miner else 0

async def update_user_balance(wallet: str, amount: float):
    """Update user's $GANG balance"""
    await db.miners.update_one(
        {"wallet_address": wallet.lower()},
        {"$inc": {"balance": amount}}
    )

async def add_trading_fee(amount: float):
    """Record trading fee earnings"""
    await db.house_earnings.insert_one({
        "type": "trading_fee",
        "amount": amount,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

# ============ ENDPOINTS ============

@router.get("/pairs")
async def get_trading_pairs():
    """Get all available trading pairs with live prices"""
    pairs = []
    for symbol, info in TRADING_PAIRS.items():
        price = await get_price(symbol)
        pairs.append({
            "symbol": symbol,
            "name": info["name"],
            "icon": info["icon"],
            "price": price,
            "leverages": LEVERAGE_OPTIONS
        })
    return {"success": True, "pairs": pairs, "fee": TRADING_FEE * 100}

@router.get("/price/{pair}")
async def get_pair_price(pair: str):
    """Get live price for a specific pair"""
    pair = pair.upper()
    if pair not in TRADING_PAIRS:
        return {"success": False, "error": "Invalid pair"}
    
    price = await get_price(pair)
    return {"success": True, "pair": pair, "price": price}

@router.post("/open")
async def open_position(request: OpenPositionRequest):
    """Open a new leveraged position"""
    wallet = request.wallet_address.lower()
    pair = request.pair.upper()
    direction = request.direction.lower()
    leverage = request.leverage
    amount = request.amount
    
    # Validations
    if pair not in TRADING_PAIRS:
        return {"success": False, "error": "Invalid trading pair"}
    
    if direction not in ["long", "short"]:
        return {"success": False, "error": "Direction must be 'long' or 'short'"}
    
    if leverage not in LEVERAGE_OPTIONS:
        return {"success": False, "error": f"Leverage must be one of {LEVERAGE_OPTIONS}"}
    
    if amount < MIN_POSITION:
        return {"success": False, "error": f"Minimum position is {MIN_POSITION} $GANG"}
    
    # Check balance
    balance = await get_user_balance(wallet)
    if balance < amount:
        return {"success": False, "error": f"Insufficient balance. You have {balance:.2f} $GANG"}
    
    # Get current price
    entry_price = await get_price(pair)
    if not entry_price:
        return {"success": False, "error": "Could not fetch price. Try again."}
    
    # Calculate fees
    fee = amount * TRADING_FEE
    position_amount = amount - fee
    
    # Deduct from balance
    await update_user_balance(wallet, -amount)
    await add_trading_fee(fee)
    
    # Calculate liquidation price
    if direction == "long":
        liq_price = entry_price * (1 - (1 / leverage))
    else:
        liq_price = entry_price * (1 + (1 / leverage))
    
    # Create position
    position_id = uuid.uuid4().hex[:12].upper()
    position = {
        "position_id": position_id,
        "wallet_address": wallet,
        "pair": pair,
        "direction": direction,
        "leverage": leverage,
        "amount": position_amount,
        "entry_price": entry_price,
        "liquidation_price": liq_price,
        "status": "open",
        "opened_at": datetime.now(timezone.utc).isoformat(),
        "closed_at": None,
        "close_price": None,
        "pnl": None,
        "fee_paid": fee
    }
    
    await db.positions.insert_one(position)
    
    return {
        "success": True,
        "position_id": position_id,
        "pair": pair,
        "direction": direction,
        "leverage": leverage,
        "amount": round(position_amount, 4),
        "entry_price": entry_price,
        "liquidation_price": round(liq_price, 8),
        "fee": round(fee, 4),
        "message": f"Opened {leverage}x {direction.upper()} on {pair} at ${entry_price}"
    }

@router.post("/close")
async def close_position(request: ClosePositionRequest):
    """Close an open position"""
    wallet = request.wallet_address.lower()
    position_id = request.position_id.upper()
    
    # Find position
    position = await db.positions.find_one({
        "position_id": position_id,
        "wallet_address": wallet,
        "status": "open"
    }, {"_id": 0})
    
    if not position:
        return {"success": False, "error": "Position not found or already closed"}
    
    # Get current price
    current_price = await get_price(position["pair"])
    if not current_price:
        return {"success": False, "error": "Could not fetch price. Try again."}
    
    # Calculate PnL
    entry_price = position["entry_price"]
    amount = position["amount"]
    leverage = position["leverage"]
    direction = position["direction"]
    
    if direction == "long":
        price_change = (current_price - entry_price) / entry_price
    else:
        price_change = (entry_price - current_price) / entry_price
    
    pnl_percent = price_change * leverage
    pnl = amount * pnl_percent
    
    # Calculate close fee
    close_value = amount + pnl
    fee = abs(close_value) * TRADING_FEE
    final_pnl = pnl - fee
    
    # Final amount to return
    return_amount = max(0, amount + final_pnl)
    
    # Update balance
    await update_user_balance(wallet, return_amount)
    await add_trading_fee(fee)
    
    # Update position
    await db.positions.update_one(
        {"position_id": position_id},
        {"$set": {
            "status": "closed",
            "closed_at": datetime.now(timezone.utc).isoformat(),
            "close_price": current_price,
            "pnl": final_pnl,
            "close_fee": fee
        }}
    )
    
    return {
        "success": True,
        "position_id": position_id,
        "entry_price": entry_price,
        "close_price": current_price,
        "pnl": round(final_pnl, 4),
        "pnl_percent": round(pnl_percent * 100, 2),
        "returned": round(return_amount, 4),
        "fee": round(fee, 4),
        "message": f"{'Profit' if final_pnl > 0 else 'Loss'}: {final_pnl:+.2f} $GANG ({pnl_percent*100:+.1f}%)"
    }

@router.get("/positions/{wallet_address}")
async def get_positions(wallet_address: str):
    """Get all positions for a user"""
    wallet = wallet_address.lower()
    
    # Get open positions
    open_positions = await db.positions.find(
        {"wallet_address": wallet, "status": "open"}, {"_id": 0},
        {"_id": 0}
    ).to_list(100)
    
    # Calculate live PnL for each
    for pos in open_positions:
        current_price = await get_price(pos["pair"])
        if current_price:
            entry = pos["entry_price"]
            if pos["direction"] == "long":
                change = (current_price - entry) / entry
            else:
                change = (entry - current_price) / entry
            
            pnl_percent = change * pos["leverage"]
            pnl = pos["amount"] * pnl_percent
            
            pos["current_price"] = current_price
            pos["unrealized_pnl"] = round(pnl, 4)
            pos["pnl_percent"] = round(pnl_percent * 100, 2)
    
    # Get recent closed positions
    closed_positions = await db.positions.find(
        {"wallet_address": wallet, "status": {"$in": ["closed", "liquidated"]}},
        {"_id": 0}
    ).sort("closed_at", -1).limit(20).to_list(20)
    
    # Calculate totals
    total_pnl = sum(p.get("pnl", 0) for p in closed_positions)
    
    return {
        "success": True,
        "open_positions": open_positions,
        "closed_positions": closed_positions,
        "total_realized_pnl": round(total_pnl, 4)
    }

@router.post("/check-liquidations")
async def check_liquidations():
    """Check all open positions for liquidation (call this periodically)"""
    open_positions = await db.positions.find({"status": "open"}).to_list(1000)
    
    liquidated = []
    
    for pos in open_positions:
        current_price = await get_price(pos["pair"])
        if not current_price:
            continue
        
        should_liquidate = False
        
        if pos["direction"] == "long" and current_price <= pos["liquidation_price"]:
            should_liquidate = True
        elif pos["direction"] == "short" and current_price >= pos["liquidation_price"]:
            should_liquidate = True
        
        if should_liquidate:
            # Liquidate position
            await db.positions.update_one(
                {"position_id": pos["position_id"]},
                {"$set": {
                    "status": "liquidated",
                    "closed_at": datetime.now(timezone.utc).isoformat(),
                    "close_price": current_price,
                    "pnl": -pos["amount"]  # Lost entire position
                }}
            )
            
            # Record as house earnings (liquidated funds go to house)
            await add_trading_fee(pos["amount"])
            
            liquidated.append({
                "position_id": pos["position_id"],
                "wallet": pos["wallet_address"],
                "pair": pos["pair"],
                "amount_liquidated": pos["amount"]
            })
    
    return {"success": True, "liquidated": len(liquidated), "positions": liquidated}

@router.get("/stats")
async def get_trading_stats():
    """Get overall trading statistics"""
    total_positions = await db.positions.count_documents({})
    open_positions = await db.positions.count_documents({"status": "open"})
    liquidations = await db.positions.count_documents({"status": "liquidated"})
    
    volume = await db.positions.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    fees = await db.house_earnings.aggregate([
        {"$match": {"type": "trading_fee"}},
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    return {
        "success": True,
        "total_positions": total_positions,
        "open_positions": open_positions,
        "liquidations": liquidations,
        "total_volume": volume[0]["total"] if volume else 0,
        "total_fees_earned": fees[0]["total"] if fees else 0
    }
