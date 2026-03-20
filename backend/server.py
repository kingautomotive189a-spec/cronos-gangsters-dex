from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field, ConfigDict
from typing import List, Optional
import uuid
from datetime import datetime, timezone
import httpx
import asyncio

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI(title="Cronos Gangsters DEX API")

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

# =====================
# Token Configuration
# =====================
TOKENS = {
    "GANG": {
        "symbol": "GANG",
        "name": "Cronos Gangsta",
        "address": "0x...",
        "decimals": 18,
        "logo": "https://i.ibb.co/Y7qFYdDM/A-modern-sleek-gangster-themed-cryptocurrency-logo-for-GANG-token-Features-a-stylized-gold-colored.png",
        "price_usd": 0.00001306,
        "price_cro": 0.00001735
    },
    "WCRO": {
        "symbol": "WCRO",
        "name": "Wrapped CRO",
        "address": "0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23",
        "decimals": 18,
        "logo": "https://cryptologos.cc/logos/cronos-cro-logo.png",
        "price_usd": 0.0753,
        "price_cro": 1.0
    },
    "USDC": {
        "symbol": "USDC",
        "name": "USD Coin",
        "address": "0xc21223249CA28397B4B6541dfFaEcC539BfF0c59",
        "decimals": 6,
        "logo": "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
        "price_usd": 1.0,
        "price_cro": 13.28
    },
    "USDT": {
        "symbol": "USDT",
        "name": "Tether USD",
        "address": "0x66e428c3f67a68878562e79A0234c1F83c208770",
        "decimals": 6,
        "logo": "https://cryptologos.cc/logos/tether-usdt-logo.png",
        "price_usd": 1.0,
        "price_cro": 13.28
    },
    "WETH": {
        "symbol": "WETH",
        "name": "Wrapped Ether",
        "address": "0xe44Fd7fCb2b1581822D0c862B68222998a0c299a",
        "decimals": 18,
        "logo": "https://cryptologos.cc/logos/ethereum-eth-logo.png",
        "price_usd": 1850.0,
        "price_cro": 24568.0
    },
    "WBTC": {
        "symbol": "WBTC",
        "name": "Wrapped Bitcoin",
        "address": "0x062E66477Faf219F25D27dCED647BF57C3107d52",
        "decimals": 8,
        "logo": "https://cryptologos.cc/logos/wrapped-bitcoin-wbtc-logo.png",
        "price_usd": 43500.0,
        "price_cro": 577690.0
    }
}

# Farming pools configuration
FARMING_POOLS = [
    {
        "id": "gang-cro",
        "name": "GANG/CRO",
        "token0": "GANG",
        "token1": "WCRO",
        "apr": 245.5,
        "tvl": 1300,
        "multiplier": "10x",
        "earned_token": "GANG"
    },
    {
        "id": "gang-usdc",
        "name": "GANG/USDC",
        "token0": "GANG",
        "token1": "USDC",
        "apr": 180.2,
        "tvl": 850,
        "multiplier": "8x",
        "earned_token": "GANG"
    },
    {
        "id": "cro-usdc",
        "name": "CRO/USDC",
        "token0": "WCRO",
        "token1": "USDC",
        "apr": 45.8,
        "tvl": 125000,
        "multiplier": "2x",
        "earned_token": "GANG"
    },
    {
        "id": "eth-cro",
        "name": "ETH/CRO",
        "token0": "WETH",
        "token1": "WCRO",
        "apr": 65.3,
        "tvl": 89000,
        "multiplier": "3x",
        "earned_token": "GANG"
    }
]

# Staking tiers
STAKING_TIERS = [
    {"months": 6, "apy": 45, "multiplier": "1x"},
    {"months": 12, "apy": 80, "multiplier": "1.8x"},
    {"months": 18, "apy": 110, "multiplier": "2.4x"},
    {"months": 24, "apy": 150, "multiplier": "3.3x"},
    {"months": 36, "apy": 210, "multiplier": "4.7x"},
    {"months": 48, "apy": 300, "multiplier": "MAX"}
]

# =====================
# Pydantic Models
# =====================

class Token(BaseModel):
    symbol: str
    name: str
    address: str
    decimals: int
    logo: str
    price_usd: float
    price_cro: float

class SwapQuote(BaseModel):
    from_token: str
    to_token: str
    from_amount: float
    to_amount: float
    price_impact: float
    minimum_received: float
    fee: float
    rate: float

class SwapRequest(BaseModel):
    from_token: str
    to_token: str
    amount: float
    wallet_address: str
    slippage: float = 0.5

class SwapTransaction(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    from_token: str
    to_token: str
    from_amount: float
    to_amount: float
    wallet_address: str
    timestamp: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "completed"
    tx_hash: str = Field(default_factory=lambda: "0x" + uuid.uuid4().hex)

class StakeRequest(BaseModel):
    wallet_address: str
    amount: float
    lock_months: int

class Stake(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_address: str
    amount: float
    lock_months: int
    apy: float
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    unlock_date: datetime
    rewards_earned: float = 0.0
    status: str = "active"

class FarmPosition(BaseModel):
    model_config = ConfigDict(extra="ignore")
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    wallet_address: str
    pool_id: str
    lp_amount: float
    rewards_earned: float = 0.0
    start_date: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    status: str = "active"

class FarmDepositRequest(BaseModel):
    wallet_address: str
    pool_id: str
    amount: float

class WalletBalance(BaseModel):
    token: str
    balance: float
    value_usd: float

# =====================
# API Routes
# =====================

@api_router.get("/")
async def root():
    return {"message": "Cronos Gangsters DEX API", "version": "1.0.0"}

# Token routes
@api_router.get("/tokens", response_model=List[Token])
async def get_tokens():
    """Get all available tokens"""
    return list(TOKENS.values())

@api_router.get("/tokens/{symbol}", response_model=Token)
async def get_token(symbol: str):
    """Get token by symbol"""
    symbol = symbol.upper()
    if symbol not in TOKENS:
        raise HTTPException(status_code=404, detail="Token not found")
    return TOKENS[symbol]

@api_router.get("/token-prices")
async def get_token_prices():
    """Get current prices for all tokens"""
    prices = {}
    for symbol, token in TOKENS.items():
        prices[symbol] = {
            "usd": token["price_usd"],
            "cro": token["price_cro"]
        }
    return prices

# Swap routes
@api_router.post("/swap/quote", response_model=SwapQuote)
async def get_swap_quote(from_token: str, to_token: str, amount: float):
    """Get swap quote"""
    from_token = from_token.upper()
    to_token = to_token.upper()
    
    if from_token not in TOKENS:
        raise HTTPException(status_code=400, detail=f"Unknown token: {from_token}")
    if to_token not in TOKENS:
        raise HTTPException(status_code=400, detail=f"Unknown token: {to_token}")
    
    from_price = TOKENS[from_token]["price_usd"]
    to_price = TOKENS[to_token]["price_usd"]
    
    # Calculate output amount
    from_value_usd = amount * from_price
    to_amount = from_value_usd / to_price
    
    # Calculate fees (0.3% trading fee)
    fee = to_amount * 0.003
    to_amount_after_fee = to_amount - fee
    
    # Calculate price impact (simulated based on amount)
    price_impact = min(amount * 0.0001, 5.0)  # Max 5% impact
    
    # Calculate rate
    rate = to_amount_after_fee / amount if amount > 0 else 0
    
    # Minimum received (with 0.5% slippage)
    minimum_received = to_amount_after_fee * 0.995
    
    return SwapQuote(
        from_token=from_token,
        to_token=to_token,
        from_amount=amount,
        to_amount=to_amount_after_fee,
        price_impact=round(price_impact, 4),
        minimum_received=round(minimum_received, 6),
        fee=round(fee, 6),
        rate=round(rate, 8)
    )

@api_router.post("/swap/execute", response_model=SwapTransaction)
async def execute_swap(request: SwapRequest):
    """Execute a swap (simulated)"""
    # Get quote first
    quote = await get_swap_quote(request.from_token, request.to_token, request.amount)
    
    # Create transaction
    tx = SwapTransaction(
        from_token=request.from_token,
        to_token=request.to_token,
        from_amount=request.amount,
        to_amount=quote.to_amount,
        wallet_address=request.wallet_address
    )
    
    # Store transaction
    tx_dict = tx.model_dump()
    tx_dict['timestamp'] = tx_dict['timestamp'].isoformat()
    await db.swap_transactions.insert_one(tx_dict)
    
    return tx

@api_router.get("/swap/history/{wallet_address}", response_model=List[SwapTransaction])
async def get_swap_history(wallet_address: str):
    """Get swap history for a wallet"""
    transactions = await db.swap_transactions.find(
        {"wallet_address": wallet_address},
        {"_id": 0}
    ).sort("timestamp", -1).to_list(100)
    
    for tx in transactions:
        if isinstance(tx['timestamp'], str):
            tx['timestamp'] = datetime.fromisoformat(tx['timestamp'])
    
    return transactions

# Staking routes
@api_router.get("/staking/tiers")
async def get_staking_tiers():
    """Get available staking tiers"""
    return STAKING_TIERS

@api_router.post("/staking/stake", response_model=Stake)
async def create_stake(request: StakeRequest):
    """Create a new stake"""
    # Find the tier
    tier = next((t for t in STAKING_TIERS if t["months"] == request.lock_months), None)
    if not tier:
        raise HTTPException(status_code=400, detail="Invalid lock period")
    
    # Calculate unlock date
    from datetime import timedelta
    start_date = datetime.now(timezone.utc)
    unlock_date = start_date + timedelta(days=request.lock_months * 30)
    
    stake = Stake(
        wallet_address=request.wallet_address,
        amount=request.amount,
        lock_months=request.lock_months,
        apy=tier["apy"],
        start_date=start_date,
        unlock_date=unlock_date
    )
    
    # Store stake
    stake_dict = stake.model_dump()
    stake_dict['start_date'] = stake_dict['start_date'].isoformat()
    stake_dict['unlock_date'] = stake_dict['unlock_date'].isoformat()
    await db.stakes.insert_one(stake_dict)
    
    return stake

@api_router.get("/staking/positions/{wallet_address}", response_model=List[Stake])
async def get_stake_positions(wallet_address: str):
    """Get staking positions for a wallet"""
    stakes = await db.stakes.find(
        {"wallet_address": wallet_address, "status": "active"},
        {"_id": 0}
    ).to_list(100)
    
    for stake in stakes:
        if isinstance(stake['start_date'], str):
            stake['start_date'] = datetime.fromisoformat(stake['start_date'])
        if isinstance(stake['unlock_date'], str):
            stake['unlock_date'] = datetime.fromisoformat(stake['unlock_date'])
        
        # Calculate rewards earned so far
        days_staked = (datetime.now(timezone.utc) - stake['start_date']).days
        daily_rate = stake['apy'] / 365 / 100
        stake['rewards_earned'] = stake['amount'] * daily_rate * days_staked
    
    return stakes

@api_router.get("/staking/stats")
async def get_staking_stats():
    """Get global staking statistics"""
    pipeline = [
        {"$match": {"status": "active"}},
        {"$group": {
            "_id": None,
            "total_staked": {"$sum": "$amount"},
            "total_stakers": {"$sum": 1},
            "avg_lock_months": {"$avg": "$lock_months"}
        }}
    ]
    
    result = await db.stakes.aggregate(pipeline).to_list(1)
    
    if result:
        stats = result[0]
        total_staked = stats.get("total_staked", 0)
        return {
            "total_staked": total_staked,
            "tvl_usd": total_staked * TOKENS["GANG"]["price_usd"],
            "total_stakers": stats.get("total_stakers", 0),
            "avg_lock_months": round(stats.get("avg_lock_months", 0), 1),
            "rewards_distributed": total_staked * 0.15  # Simulated
        }
    
    return {
        "total_staked": 0,
        "tvl_usd": 0,
        "total_stakers": 0,
        "avg_lock_months": 0,
        "rewards_distributed": 0
    }

# Farming routes
@api_router.get("/farms")
async def get_farms():
    """Get all farming pools"""
    pools = []
    for pool in FARMING_POOLS:
        pool_data = {**pool}
        pool_data["token0_info"] = TOKENS.get(pool["token0"], {})
        pool_data["token1_info"] = TOKENS.get(pool["token1"], {})
        pools.append(pool_data)
    return pools

@api_router.post("/farms/deposit", response_model=FarmPosition)
async def deposit_to_farm(request: FarmDepositRequest):
    """Deposit LP tokens to a farm"""
    pool = next((p for p in FARMING_POOLS if p["id"] == request.pool_id), None)
    if not pool:
        raise HTTPException(status_code=404, detail="Farm pool not found")
    
    position = FarmPosition(
        wallet_address=request.wallet_address,
        pool_id=request.pool_id,
        lp_amount=request.amount
    )
    
    pos_dict = position.model_dump()
    pos_dict['start_date'] = pos_dict['start_date'].isoformat()
    await db.farm_positions.insert_one(pos_dict)
    
    return position

@api_router.get("/farms/positions/{wallet_address}", response_model=List[FarmPosition])
async def get_farm_positions(wallet_address: str):
    """Get farming positions for a wallet"""
    positions = await db.farm_positions.find(
        {"wallet_address": wallet_address, "status": "active"},
        {"_id": 0}
    ).to_list(100)
    
    for pos in positions:
        if isinstance(pos['start_date'], str):
            pos['start_date'] = datetime.fromisoformat(pos['start_date'])
        
        # Calculate rewards earned
        pool = next((p for p in FARMING_POOLS if p["id"] == pos["pool_id"]), None)
        if pool:
            days_staked = (datetime.now(timezone.utc) - pos['start_date']).days
            daily_rate = pool["apr"] / 365 / 100
            pos['rewards_earned'] = pos['lp_amount'] * daily_rate * max(days_staked, 1)
    
    return positions

# Wallet routes (simulated balances)
@api_router.get("/wallet/balances/{wallet_address}")
async def get_wallet_balances(wallet_address: str):
    """Get simulated wallet balances"""
    # Return simulated balances for demo purposes
    balances = []
    
    # Check if wallet has any stored balances
    stored = await db.wallet_balances.find_one(
        {"wallet_address": wallet_address},
        {"_id": 0}
    )
    
    if stored:
        for token_symbol, balance in stored.get("balances", {}).items():
            if token_symbol in TOKENS:
                token = TOKENS[token_symbol]
                balances.append({
                    "token": token_symbol,
                    "balance": balance,
                    "value_usd": balance * token["price_usd"],
                    "token_info": token
                })
    else:
        # Default demo balances
        default_balances = {
            "GANG": 100000,
            "WCRO": 500,
            "USDC": 250
        }
        
        for token_symbol, balance in default_balances.items():
            if token_symbol in TOKENS:
                token = TOKENS[token_symbol]
                balances.append({
                    "token": token_symbol,
                    "balance": balance,
                    "value_usd": balance * token["price_usd"],
                    "token_info": token
                })
        
        # Store default balances
        await db.wallet_balances.insert_one({
            "wallet_address": wallet_address,
            "balances": default_balances
        })
    
    return balances

@api_router.post("/wallet/update-balance")
async def update_wallet_balance(wallet_address: str, token: str, amount: float):
    """Update wallet balance after swap/stake"""
    await db.wallet_balances.update_one(
        {"wallet_address": wallet_address},
        {"$set": {f"balances.{token}": amount}},
        upsert=True
    )
    return {"success": True}

# DEX Statistics
@api_router.get("/dex/stats")
async def get_dex_stats():
    """Get overall DEX statistics"""
    # Count transactions
    tx_count = await db.swap_transactions.count_documents({})
    
    # Get total volume (simulated)
    volume_24h = 12500  # Simulated
    
    return {
        "total_transactions": tx_count,
        "volume_24h": volume_24h,
        "gang_price": TOKENS["GANG"]["price_usd"],
        "gang_market_cap": 13000,
        "gang_liquidity": 1300,
        "total_tvl": 215000,  # Simulated TVL
        "gang_24h_change": -0.15
    }

# Price history (simulated)
@api_router.get("/price-history/{token}")
async def get_price_history(token: str, timeframe: str = "24h"):
    """Get price history for charting"""
    import random
    
    token = token.upper()
    if token not in TOKENS:
        raise HTTPException(status_code=404, detail="Token not found")
    
    base_price = TOKENS[token]["price_usd"]
    
    # Generate simulated price points
    points = []
    if timeframe == "24h":
        intervals = 24
    elif timeframe == "7d":
        intervals = 7 * 24
    else:
        intervals = 30 * 24
    
    for i in range(intervals):
        timestamp = datetime.now(timezone.utc) - timedelta(hours=intervals - i)
        # Add some random variation
        variation = random.uniform(-0.05, 0.05)
        price = base_price * (1 + variation)
        points.append({
            "timestamp": timestamp.isoformat(),
            "price": price
        })
    
    return {
        "token": token,
        "timeframe": timeframe,
        "data": points
    }

# Need this import for price history
from datetime import timedelta

# Include the router in the main app
app.include_router(api_router)

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
