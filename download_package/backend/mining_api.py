# Extended Mining API - ALL GAMES
from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime, timezone, timedelta
from motor.motor_asyncio import AsyncIOMotorClient
import os
import uuid
import random
import math

router = APIRouter(prefix="/mining", tags=["mining"])

mongo_url = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'test_database')]

# Config
BASE_REWARD = 5.0
HALVING_INTERVAL = 1000
MIN_WITHDRAWAL = 100
REFERRAL_BONUS = 0.10
CLAIM_COOLDOWN = 24
BURN_RATE = 0.05

# House edges
HOUSE_EDGE = {
    "lottery": 0.30,
    "prediction": 0.10,
    "coinflip": 0.05,
    "dice": 0.05,
    "crash": 0.05,
    "slots": 0.10,
    "rps": 0.05,
    "highlow": 0.05,
    "wheel": 0.08,
    "blackjack": 0.05,
    "limbo": 0.05,
    "pvp": 0.10,
    "leverage": 0.05,
    "tournament": 0.30,
    "mysterybox": 0.40,
    "roulette": 0.027,
    "baccarat": 0.05,
    "videopoker": 0.05,
    "horseracing": 0.10,
    "carracing": 0.10,
    "scratchcard": 0.30,
    "mines": 0.03,
    "plinko": 0.04,
    "tower": 0.04,
}

VIP_TIERS = {
    "free": {"cost": 0, "multiplier": 1.0, "name": "Free"},
    "bronze": {"cost": 50, "multiplier": 2.0, "name": "Bronze"},
    "silver": {"cost": 150, "multiplier": 3.0, "name": "Silver"},
    "gold": {"cost": 500, "multiplier": 5.0, "name": "Gold"},
}

STAKING_POOLS = {
    "30days": {"days": 30, "apy": 50, "name": "30 Days"},
    "60days": {"days": 60, "apy": 100, "name": "60 Days"},
    "90days": {"days": 90, "apy": 200, "name": "90 Days"},
}

MYSTERY_BOXES = {
    "bronze": {"cost": 20, "prizes": [5, 10, 15, 25, 50], "weights": [40, 30, 15, 10, 5]},
    "silver": {"cost": 50, "prizes": [10, 25, 50, 75, 150], "weights": [40, 30, 15, 10, 5]},
    "gold": {"cost": 100, "prizes": [25, 50, 100, 200, 500], "weights": [40, 30, 15, 10, 5]},
}

WHEEL_SEGMENTS = [
    {"multiplier": 0, "label": "LOSE", "weight": 20},
    {"multiplier": 0.5, "label": "0.5x", "weight": 25},
    {"multiplier": 1, "label": "1x", "weight": 20},
    {"multiplier": 1.5, "label": "1.5x", "weight": 15},
    {"multiplier": 2, "label": "2x", "weight": 10},
    {"multiplier": 3, "label": "3x", "weight": 6},
    {"multiplier": 5, "label": "5x", "weight": 3},
    {"multiplier": 10, "label": "10x", "weight": 1},
]

DAILY_WHEEL = [
    {"prize": 1, "label": "1 $GANG", "weight": 30},
    {"prize": 2, "label": "2 $GANG", "weight": 25},
    {"prize": 5, "label": "5 $GANG", "weight": 20},
    {"prize": 10, "label": "10 $GANG", "weight": 15},
    {"prize": 25, "label": "25 $GANG", "weight": 7},
    {"prize": 50, "label": "50 $GANG", "weight": 3},
]

SLOTS_SYMBOLS = ["🍒", "🍋", "🍊", "🍇", "💎", "7️⃣", "🎰"]
SLOTS_PAYOUTS = {
    "🍒🍒🍒": 3, "🍋🍋🍋": 5, "🍊🍊🍊": 8,
    "🍇🍇🍇": 10, "💎💎💎": 25, "7️⃣7️⃣7️⃣": 50, "🎰🎰🎰": 100
}

# Request Models
class WalletRequest(BaseModel):
    wallet_address: str

class RegisterRequest(BaseModel):
    wallet_address: str
    referrer_code: Optional[str] = None

class GameRequest(BaseModel):
    wallet_address: str
    amount: float
    choice: Optional[str] = None

class CrashRequest(BaseModel):
    wallet_address: str
    amount: float
    auto_cashout: Optional[float] = None

class LeverageRequest(BaseModel):
    wallet_address: str
    amount: float
    direction: str  # "long" or "short"
    leverage: int  # 10, 25, 50, 100

class TournamentJoinRequest(BaseModel):
    wallet_address: str
    tournament_id: str

class MysteryBoxRequest(BaseModel):
    wallet_address: str
    box_type: str

class PvPRequest(BaseModel):
    wallet_address: str
    amount: float
    game_type: str

class StakeRequest(BaseModel):
    wallet_address: str
    pool: str
    amount: float

class VIPRequest(BaseModel):
    wallet_address: str
    tier: str

class LotteryRequest(BaseModel):
    wallet_address: str
    tickets: int

class PredictionRequest(BaseModel):
    wallet_address: str
    prediction: str
    amount: float

class UnstakeRequest(BaseModel):
    wallet_address: str
    stake_id: str

# Helper functions
def generate_code():
    return uuid.uuid4().hex[:8].upper()

def calculate_reward(total_users):
    if total_users == 0:
        return BASE_REWARD
    halvings = total_users // HALVING_INTERVAL
    return BASE_REWARD / (2 ** halvings)

async def add_house_earnings(game_type, amount):
    await db.house_earnings.insert_one({
        "type": game_type,
        "amount": amount,
        "timestamp": datetime.now(timezone.utc).isoformat()
    })

async def add_to_jackpot(amount):
    await db.jackpot.update_one(
        {"active": True},
        {"$inc": {"pool": amount}},
        upsert=True
    )

async def get_user(wallet):
    return await db.miners.find_one({"wallet_address": wallet.lower()}, {"_id": 0})

async def update_balance(wallet, amount):
    await db.miners.update_one(
        {"wallet_address": wallet.lower()},
        {"$inc": {"balance": amount}}
    )

# ============ CORE ENDPOINTS ============

@router.get("/stats")
async def get_stats():
    total_users = await db.miners.count_documents({})
    current_reward = calculate_reward(total_users)
    
    total_burned = await db.burns.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    house_earnings = await db.house_earnings.aggregate([
        {"$group": {"_id": None, "total": {"$sum": "$amount"}}}
    ]).to_list(1)
    
    lottery = await db.lottery_rounds.find_one({"status": "active"}, {"_id": 0})
    jackpot = await db.jackpot.find_one({"active": True}, {"_id": 0})
    
    active_tournament = await db.tournaments.find_one({"status": "active"}, {"_id": 0})
    
    return {
        "success": True,
        "total_users": total_users,
        "current_reward": round(current_reward, 4),
        "total_burned": total_burned[0]["total"] if total_burned else 0,
        "house_earnings": house_earnings[0]["total"] if house_earnings else 0,
        "lottery_pot": lottery["pot"] if lottery else 0,
        "jackpot_pool": jackpot["pool"] if jackpot else 0,
        "active_tournament": active_tournament,
        "vip_tiers": VIP_TIERS,
        "staking_pools": STAKING_POOLS,
        "mystery_boxes": {k: {"cost": v["cost"]} for k, v in MYSTERY_BOXES.items()},
        "min_withdrawal": MIN_WITHDRAWAL,
        "burn_rate": BURN_RATE * 100,
    }

@router.post("/register")
async def register(request: RegisterRequest):
    wallet = request.wallet_address.lower()
    existing = await db.miners.find_one({"wallet_address": wallet}, {"_id": 0})
    
    if existing:
        return {"success": True, "message": "Welcome back!", "is_new": False, "referral_code": existing["referral_code"]}
    
    referrer = None
    if request.referrer_code:
        ref = await db.miners.find_one({"referral_code": request.referrer_code.upper()}, {"_id": 0})
        if ref:
            referrer = ref["wallet_address"]
            await db.miners.update_one({"wallet_address": referrer}, {"$inc": {"referral_count": 1}})
    
    code = generate_code()
    await db.miners.insert_one({
        "wallet_address": wallet,
        "referral_code": code,
        "referred_by": referrer,
        "balance": 0.0,
        "total_mined": 0.0,
        "total_referral_earned": 0.0,
        "referral_count": 0,
        "last_claim": None,
        "last_daily_wheel": None,
        "vip_tier": "free",
        "created_at": datetime.now(timezone.utc).isoformat(),
        "game_stats": {"wins": 0, "losses": 0, "profit": 0},
    })
    
    return {"success": True, "message": "Welcome to $GANG!", "is_new": True, "referral_code": code}

@router.get("/user/{wallet_address}")
async def get_user_data(wallet_address: str):
    wallet = wallet_address.lower()
    miner = await db.miners.find_one({"wallet_address": wallet}, {"_id": 0})
    
    if not miner:
        return {"success": False, "error": "Not registered"}
    
    can_claim = True
    next_claim = None
    if miner.get("last_claim"):
        last = datetime.fromisoformat(miner["last_claim"])
        next_time = last + timedelta(hours=CLAIM_COOLDOWN)
        if datetime.now(timezone.utc) < next_time:
            can_claim = False
            next_claim = next_time.isoformat()
    
    can_daily_wheel = True
    if miner.get("last_daily_wheel"):
        last = datetime.fromisoformat(miner["last_daily_wheel"])
        next_time = last + timedelta(hours=24)
        if datetime.now(timezone.utc) < next_time:
            can_daily_wheel = False
    
    lottery = await db.lottery_rounds.find_one({"status": "active"}, {"_id": 0})
    tickets = 0
    if lottery:
        t = await db.lottery_tickets.find_one({"round_id": lottery["round_id"], "wallet_address": wallet}, {"_id": 0})
        tickets = t["tickets"] if t else 0
    
    stakes = await db.stakes.find({"wallet_address": wallet, "status": "active"}, {"_id": 0}).to_list(100)
    
    vip_multi = VIP_TIERS.get(miner.get("vip_tier", "free"), {}).get("multiplier", 1.0)
    
    return {
        "success": True,
        "balance": miner["balance"],
        "total_mined": miner.get("total_mined", 0),
        "referral_code": miner["referral_code"],
        "referral_count": miner.get("referral_count", 0),
        "total_referral_earned": miner.get("total_referral_earned", 0),
        "can_claim": can_claim,
        "next_claim_time": next_claim,
        "can_daily_wheel": can_daily_wheel,
        "vip_tier": miner.get("vip_tier", "free"),
        "vip_multiplier": vip_multi,
        "lottery_tickets": tickets,
        "active_stakes": stakes,
        "game_stats": miner.get("game_stats", {}),
    }

@router.post("/claim")
async def claim(request: WalletRequest):
    wallet = request.wallet_address.lower()
    miner = await get_user(wallet)
    if not miner:
        return {"success": False, "error": "Not registered"}
    
    now = datetime.now(timezone.utc)
    if miner.get("last_claim"):
        last = datetime.fromisoformat(miner["last_claim"])
        if now < last + timedelta(hours=CLAIM_COOLDOWN):
            return {"success": False, "error": "Too early"}
    
    total_users = await db.miners.count_documents({})
    base = calculate_reward(total_users)
    multi = VIP_TIERS.get(miner.get("vip_tier", "free"), {}).get("multiplier", 1.0)
    reward = base * multi
    
    if miner.get("referred_by"):
        bonus = reward * REFERRAL_BONUS
        await db.miners.update_one(
            {"wallet_address": miner["referred_by"]},
            {"$inc": {"balance": bonus, "total_referral_earned": bonus}}
        )
    
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"balance": reward, "total_mined": reward}, "$set": {"last_claim": now.isoformat()}}
    )
    
    # 1% to jackpot
    await add_to_jackpot(reward * 0.01)
    
    return {"success": True, "amount": round(reward, 4), "multiplier": multi}

@router.post("/withdraw")
async def withdraw(request: WalletRequest):
    wallet = request.wallet_address.lower()
    miner = await get_user(wallet)
    if not miner:
        return {"success": False, "error": "Not registered"}
    
    balance = miner["balance"]
    if balance < MIN_WITHDRAWAL:
        return {"success": False, "error": f"Minimum {MIN_WITHDRAWAL} $GANG"}
    
    burn = balance * BURN_RATE
    withdraw_amount = balance - burn
    
    await db.burns.insert_one({"wallet_address": wallet, "amount": burn, "timestamp": datetime.now(timezone.utc).isoformat()})
    
    withdrawal_id = generate_code()
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$set": {"balance": 0}, "$push": {"withdrawal_requests": {
            "id": withdrawal_id, "amount": withdraw_amount, "burned": burn,
            "status": "pending", "requested_at": datetime.now(timezone.utc).isoformat()
        }}}
    )
    await db.withdrawal_requests.insert_one({
        "id": withdrawal_id, "wallet_address": wallet, "amount": withdraw_amount,
        "burned": burn, "status": "pending", "requested_at": datetime.now(timezone.utc).isoformat()
    })
    
    return {"success": True, "amount": round(withdraw_amount, 4), "burned": round(burn, 4)}

# ============ VIP ============

@router.post("/vip/upgrade")
async def upgrade_vip(request: VIPRequest):
    wallet = request.wallet_address.lower()
    tier = request.tier.lower()
    
    if tier not in VIP_TIERS:
        return {"success": False, "error": "Invalid tier"}
    
    miner = await get_user(wallet)
    if not miner:
        return {"success": False, "error": "Not registered"}
    
    cost = VIP_TIERS[tier]["cost"]
    if miner["balance"] < cost:
        return {"success": False, "error": f"Need {cost} $GANG"}
    
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"balance": -cost}, "$set": {"vip_tier": tier}}
    )
    await add_house_earnings("vip", cost)
    
    return {"success": True, "tier": tier, "multiplier": VIP_TIERS[tier]["multiplier"]}

# ============ LOTTERY ============

@router.get("/lottery/current")
async def get_lottery():
    lottery = await db.lottery_rounds.find_one({"status": "active"}, {"_id": 0})
    if not lottery:
        round_id = generate_code()
        lottery = {
            "round_id": round_id, "pot": 0, "tickets_sold": 0, "status": "active",
            "ends_at": (datetime.now(timezone.utc) + timedelta(days=7)).isoformat()
        }
        await db.lottery_rounds.insert_one(lottery)
    return {"success": True, "lottery": lottery}

@router.post("/lottery/buy")
async def buy_lottery(request: LotteryRequest):
    wallet = request.wallet_address.lower()
    tickets = request.tickets
    cost = tickets * 10
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < cost:
        return {"success": False, "error": "Insufficient balance"}
    
    lottery = await db.lottery_rounds.find_one({"status": "active"}, {"_id": 0})
    if not lottery:
        return {"success": False, "error": "No active lottery"}
    
    await update_balance(wallet, -cost)
    await db.lottery_rounds.update_one({"round_id": lottery["round_id"]}, {"$inc": {"pot": cost, "tickets_sold": tickets}})
    await db.lottery_tickets.update_one(
        {"round_id": lottery["round_id"], "wallet_address": wallet},
        {"$inc": {"tickets": tickets}}, upsert=True
    )
    
    return {"success": True, "tickets": tickets, "cost": cost}

# ============ PREDICTIONS ============

@router.get("/prediction/current")
async def get_prediction():
    pred = await db.prediction_rounds.find_one({"status": "active"}, {"_id": 0})
    if not pred:
        pred = {
            "round_id": generate_code(), "up_pool": 0, "down_pool": 0, "status": "active",
            "ends_at": (datetime.now(timezone.utc) + timedelta(hours=24)).isoformat()
        }
        await db.prediction_rounds.insert_one(pred)
    return {"success": True, "prediction": pred}

@router.post("/prediction/bet")
async def bet_prediction(request: PredictionRequest):
    wallet = request.wallet_address.lower()
    direction = request.prediction.lower()
    amount = request.amount
    
    if direction not in ["up", "down"]:
        return {"success": False, "error": "Choose up or down"}
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    pred = await db.prediction_rounds.find_one({"status": "active"}, {"_id": 0})
    if not pred:
        return {"success": False, "error": "No active round"}
    
    existing = await db.predictions.find_one({"round_id": pred["round_id"], "wallet_address": wallet}, {"_id": 0})
    if existing:
        return {"success": False, "error": "Already bet this round"}
    
    await update_balance(wallet, -amount)
    pool = "up_pool" if direction == "up" else "down_pool"
    await db.prediction_rounds.update_one({"round_id": pred["round_id"]}, {"$inc": {pool: amount}})
    await db.predictions.insert_one({
        "round_id": pred["round_id"], "wallet_address": wallet,
        "prediction": direction, "amount": amount, "status": "active"
    })
    
    return {"success": True, "prediction": direction, "amount": amount}

# ============ GAMES ============

@router.post("/game/coinflip")
async def play_coinflip(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    choice = request.choice.lower() if request.choice else "heads"
    
    if choice not in ["heads", "tails"]:
        return {"success": False, "error": "Choose heads or tails"}
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    result = random.choice(["heads", "tails"])
    win = result == choice
    
    house = amount * HOUSE_EDGE["coinflip"]
    await add_to_jackpot(amount * 0.01)
    
    if win:
        payout = (amount * 2) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("coinflip", amount)
    
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}}
    )
    
    return {"success": True, "game": "coinflip", "choice": choice, "result": result, "win": win, "payout": round(payout, 4)}

@router.post("/game/dice")
async def play_dice(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    choice = request.choice if request.choice else "1"
    
    if choice not in ["1","2","3","4","5","6"]:
        return {"success": False, "error": "Choose 1-6"}
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    result = str(random.randint(1, 6))
    win = result == choice
    
    house = amount * HOUSE_EDGE["dice"]
    await add_to_jackpot(amount * 0.01)
    
    if win:
        payout = (amount * 6) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("dice", amount)
    
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}}
    )
    
    return {"success": True, "game": "dice", "choice": choice, "result": result, "win": win, "payout": round(payout, 4)}

@router.post("/game/crash")
async def play_crash(request: CrashRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    auto_cashout = request.auto_cashout or 2.0
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    # Generate crash point (house edge built in)
    crash_point = 0.99 / random.random()
    crash_point = min(crash_point, 100)  # Cap at 100x
    crash_point = round(crash_point, 2)
    
    win = auto_cashout <= crash_point
    
    house = amount * HOUSE_EDGE["crash"]
    await add_to_jackpot(amount * 0.01)
    
    if win:
        payout = (amount * auto_cashout) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("crash", amount)
    
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}}
    )
    
    return {"success": True, "game": "crash", "crash_point": crash_point, "cashout": auto_cashout, "win": win, "payout": round(payout, 4)}

@router.post("/game/slots")
async def play_slots(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    # Spin reels with house edge
    reels = [random.choice(SLOTS_SYMBOLS) for _ in range(3)]
    result = "".join(reels)
    
    multiplier = SLOTS_PAYOUTS.get(result, 0)
    win = multiplier > 0
    
    house = amount * HOUSE_EDGE["slots"]
    await add_to_jackpot(amount * 0.01)
    
    if win:
        payout = (amount * multiplier) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("slots", amount)
    
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}}
    )
    
    return {"success": True, "game": "slots", "reels": reels, "multiplier": multiplier, "win": win, "payout": round(payout, 4)}

@router.post("/game/rps")
async def play_rps(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    choice = request.choice.lower() if request.choice else "rock"
    
    if choice not in ["rock", "paper", "scissors"]:
        return {"success": False, "error": "Choose rock, paper, or scissors"}
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    options = ["rock", "paper", "scissors"]
    house_choice = random.choice(options)
    
    wins = {"rock": "scissors", "paper": "rock", "scissors": "paper"}
    
    if choice == house_choice:
        result = "tie"
        payout = amount  # Return bet
        profit = 0
    elif wins[choice] == house_choice:
        result = "win"
        payout = (amount * 2) - (amount * HOUSE_EDGE["rps"])
        profit = payout - amount
    else:
        result = "lose"
        payout = 0
        profit = -amount
        await add_house_earnings("rps", amount)
    
    await add_to_jackpot(amount * 0.01)
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"game_stats.wins": 1 if result == "win" else 0, "game_stats.losses": 1 if result == "lose" else 0, "game_stats.profit": profit}}
    )
    
    return {"success": True, "game": "rps", "your_choice": choice, "house_choice": house_choice, "result": result, "payout": round(payout, 4)}

@router.post("/game/highlow")
async def play_highlow(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    choice = request.choice.lower() if request.choice else "high"
    
    if choice not in ["high", "low"]:
        return {"success": False, "error": "Choose high or low"}
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    first_num = random.randint(1, 100)
    second_num = random.randint(1, 100)
    
    actual = "high" if second_num > first_num else "low" if second_num < first_num else "tie"
    win = choice == actual or actual == "tie"
    
    house = amount * HOUSE_EDGE["highlow"]
    await add_to_jackpot(amount * 0.01)
    
    if win:
        payout = (amount * 2) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("highlow", amount)
    
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}}
    )
    
    return {"success": True, "game": "highlow", "first": first_num, "second": second_num, "choice": choice, "win": win, "payout": round(payout, 4)}

@router.post("/game/wheel")
async def play_wheel(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    # Weighted random selection
    weights = [s["weight"] for s in WHEEL_SEGMENTS]
    segment = random.choices(WHEEL_SEGMENTS, weights=weights)[0]
    multiplier = segment["multiplier"]
    
    win = multiplier > 0
    
    await add_to_jackpot(amount * 0.01)
    
    if win:
        payout = amount * multiplier
        profit = payout - amount
        if profit < 0:
            await add_house_earnings("wheel", abs(profit))
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("wheel", amount)
    
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"game_stats.wins": 1 if profit > 0 else 0, "game_stats.losses": 1 if profit < 0 else 0, "game_stats.profit": profit}}
    )
    
    return {"success": True, "game": "wheel", "segment": segment["label"], "multiplier": multiplier, "win": profit > 0, "payout": round(payout, 4)}

@router.post("/game/limbo")
async def play_limbo(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    target = float(request.choice) if request.choice else 2.0
    
    if target < 1.01 or target > 100:
        return {"success": False, "error": "Target must be 1.01-100"}
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    # Generate result
    result = round(0.99 / random.random(), 2)
    result = min(result, 1000)
    
    win = result >= target
    
    house = amount * HOUSE_EDGE["limbo"]
    await add_to_jackpot(amount * 0.01)
    
    if win:
        payout = (amount * target) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("limbo", amount)
    
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}}
    )
    
    return {"success": True, "game": "limbo", "target": target, "result": result, "win": win, "payout": round(payout, 4)}

@router.post("/game/blackjack")
async def play_blackjack(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    # Simplified blackjack - random hands
    player_hand = random.randint(12, 21)
    dealer_hand = random.randint(12, 21)
    
    # Bust check
    player_bust = player_hand > 21
    dealer_bust = dealer_hand > 21
    
    if player_bust:
        result = "lose"
    elif dealer_bust:
        result = "win"
    elif player_hand > dealer_hand:
        result = "win"
    elif player_hand < dealer_hand:
        result = "lose"
    else:
        result = "push"
    
    house = amount * HOUSE_EDGE["blackjack"]
    await add_to_jackpot(amount * 0.01)
    
    if result == "win":
        payout = (amount * 2) - house
        profit = payout - amount
    elif result == "push":
        payout = amount
        profit = 0
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("blackjack", amount)
    
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"game_stats.wins": 1 if result == "win" else 0, "game_stats.losses": 1 if result == "lose" else 0, "game_stats.profit": profit}}
    )
    
    return {"success": True, "game": "blackjack", "player": player_hand, "dealer": dealer_hand, "result": result, "payout": round(payout, 4)}


# ============ NEW CASINO GAMES ============

@router.post("/game/roulette")
async def play_roulette(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    choice = (request.choice or "red").lower()
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    number = random.randint(0, 36)
    reds = [1,3,5,7,9,12,14,16,18,19,21,23,25,27,30,32,34,36]
    color = "green" if number == 0 else ("red" if number in reds else "black")
    is_odd = number % 2 == 1 if number > 0 else False
    
    win = False
    multiplier = 0
    if choice in ["red", "black"]:
        win = choice == color
        multiplier = 2
    elif choice in ["odd", "even"]:
        win = (choice == "odd" and is_odd) or (choice == "even" and not is_odd and number > 0)
        multiplier = 2
    elif choice in ["1-18", "low"]:
        win = 1 <= number <= 18
        multiplier = 2
    elif choice in ["19-36", "high"]:
        win = 19 <= number <= 36
        multiplier = 2
    elif choice in ["1-12", "dozen1"]:
        win = 1 <= number <= 12
        multiplier = 3
    elif choice in ["13-24", "dozen2"]:
        win = 13 <= number <= 24
        multiplier = 3
    elif choice in ["25-36", "dozen3"]:
        win = 25 <= number <= 36
        multiplier = 3
    else:
        try:
            num_choice = int(choice)
            win = num_choice == number
            multiplier = 36
        except:
            return {"success": False, "error": "Invalid choice"}
    
    house = amount * HOUSE_EDGE["roulette"]
    await add_to_jackpot(amount * 0.01)
    if win:
        payout = (amount * multiplier) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("roulette", amount)
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one({"wallet_address": wallet}, {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}})
    return {"success": True, "game": "roulette", "choice": choice, "number": number, "color": color, "win": win, "payout": round(payout, 4)}

@router.post("/game/baccarat")
async def play_baccarat(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    choice = (request.choice or "player").lower()
    if choice not in ["player", "banker", "tie"]:
        return {"success": False, "error": "Choose player, banker, or tie"}
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    def card_val(c): return min(c, 9)
    def hand_total(cards): return sum(card_val(c) for c in cards) % 10
    
    deck = list(range(1, 10)) * 4 + [0] * 16
    random.shuffle(deck)
    player = [deck.pop(), deck.pop()]
    banker = [deck.pop(), deck.pop()]
    pt, bt = hand_total(player), hand_total(banker)
    if pt <= 5: player.append(deck.pop())
    if bt <= 5: banker.append(deck.pop())
    pt, bt = hand_total(player), hand_total(banker)
    
    result = "tie" if pt == bt else ("player" if pt > bt else "banker")
    win = choice == result
    
    house = amount * HOUSE_EDGE["baccarat"]
    await add_to_jackpot(amount * 0.01)
    if win:
        multiplier = 8 if result == "tie" else (1.95 if result == "banker" else 2)
        payout = (amount * multiplier) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("baccarat", amount)
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one({"wallet_address": wallet}, {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}})
    return {"success": True, "game": "baccarat", "choice": choice, "player_total": pt, "banker_total": bt, "result": result, "win": win, "payout": round(payout, 4)}

@router.post("/game/videopoker")
async def play_videopoker(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    suits = ["H", "D", "C", "S"]
    ranks = ["2","3","4","5","6","7","8","9","10","J","Q","K","A"]
    deck = [(r, s) for r in ranks for s in suits]
    random.shuffle(deck)
    hand = [deck.pop() for _ in range(5)]
    
    rank_counts = {}
    for r, s in hand:
        rank_counts[r] = rank_counts.get(r, 0) + 1
    counts = sorted(rank_counts.values(), reverse=True)
    suits_in_hand = set(s for _, s in hand)
    rank_indices = sorted([ranks.index(r) for r, _ in hand])
    is_flush = len(suits_in_hand) == 1
    is_straight = (rank_indices[-1] - rank_indices[0] == 4 and len(set(rank_indices)) == 5) or rank_indices == [0,1,2,3,12]
    
    if is_flush and is_straight and rank_indices[-1] == 12: result, multi = "Royal Flush", 250
    elif is_flush and is_straight: result, multi = "Straight Flush", 50
    elif counts[0] == 4: result, multi = "Four of a Kind", 25
    elif counts == [3, 2]: result, multi = "Full House", 9
    elif is_flush: result, multi = "Flush", 6
    elif is_straight: result, multi = "Straight", 4
    elif counts[0] == 3: result, multi = "Three of a Kind", 3
    elif counts[:2] == [2, 2]: result, multi = "Two Pair", 2
    elif counts[0] == 2 and any(r in ["J","Q","K","A"] for r in rank_counts if rank_counts[r] == 2): result, multi = "Jacks or Better", 1
    else: result, multi = "No Win", 0
    
    house = amount * HOUSE_EDGE["videopoker"]
    await add_to_jackpot(amount * 0.01)
    win = multi > 0
    if win:
        payout = (amount * multi) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("videopoker", amount)
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one({"wallet_address": wallet}, {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}})
    hand_str = [f"{r}{s}" for r, s in hand]
    return {"success": True, "game": "videopoker", "hand": hand_str, "result": result, "multiplier": multi, "win": win, "payout": round(payout, 4)}

@router.post("/game/horseracing")
async def play_horseracing(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    choice = (request.choice or "1")
    if choice not in ["1","2","3","4"]:
        return {"success": False, "error": "Choose horse 1-4"}
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    horses = ["1","2","3","4"]
    speeds = {h: sum(random.randint(1, 6) for _ in range(3)) for h in horses}
    ranking = sorted(horses, key=lambda h: speeds[h], reverse=True)
    winner = ranking[0]
    win = choice == winner
    
    house = amount * HOUSE_EDGE["horseracing"]
    await add_to_jackpot(amount * 0.01)
    if win:
        payout = (amount * 4) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("horseracing", amount)
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one({"wallet_address": wallet}, {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}})
    return {"success": True, "game": "horseracing", "choice": choice, "winner": winner, "ranking": ranking, "speeds": speeds, "win": win, "payout": round(payout, 4)}

@router.post("/game/carracing")
async def play_carracing(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    choice = (request.choice or "1")
    if choice not in ["1","2","3","4"]:
        return {"success": False, "error": "Choose car 1-4"}
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    cars = ["1","2","3","4"]
    speeds = {c: sum(random.randint(1, 8) for _ in range(3)) for c in cars}
    ranking = sorted(cars, key=lambda c: speeds[c], reverse=True)
    winner = ranking[0]
    win = choice == winner
    
    house = amount * HOUSE_EDGE["carracing"]
    await add_to_jackpot(amount * 0.01)
    if win:
        payout = (amount * 4) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("carracing", amount)
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one({"wallet_address": wallet}, {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}})
    return {"success": True, "game": "carracing", "choice": choice, "winner": winner, "ranking": ranking, "speeds": speeds, "win": win, "payout": round(payout, 4)}

@router.post("/game/scratchcard")
async def play_scratchcard(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    symbols = ["GANG", "CRO", "BTC", "ETH", "MOON", "STAR", "7"]
    grid = [[random.choice(symbols) for _ in range(3)] for _ in range(3)]
    
    matches = 0
    for row in grid:
        if row[0] == row[1] == row[2]: matches += 1
    for col in range(3):
        if grid[0][col] == grid[1][col] == grid[2][col]: matches += 1
    if grid[0][0] == grid[1][1] == grid[2][2]: matches += 1
    if grid[0][2] == grid[1][1] == grid[2][0]: matches += 1
    
    multipliers = {0: 0, 1: 2, 2: 5, 3: 15, 4: 50, 5: 100}
    multi = multipliers.get(matches, 200)
    
    house = amount * HOUSE_EDGE["scratchcard"]
    await add_to_jackpot(amount * 0.01)
    win = multi > 0
    if win:
        payout = (amount * multi) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("scratchcard", amount)
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one({"wallet_address": wallet}, {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}})
    return {"success": True, "game": "scratchcard", "grid": grid, "matches": matches, "multiplier": multi, "win": win, "payout": round(payout, 4)}

@router.post("/game/mines")
async def play_mines(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    num_mines = max(1, min(24, int(request.choice or "3")))
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    grid_size = 25
    mine_positions = random.sample(range(grid_size), num_mines)
    safe_picks = random.randint(1, grid_size - num_mines)
    safe_count = grid_size - num_mines
    
    multiplier = 1.0
    for i in range(safe_picks):
        multiplier *= grid_size / (grid_size - i - num_mines * (i / safe_count))
    multiplier = round(min(multiplier, 100), 2)
    hit_mine = random.random() < (num_mines / grid_size) * 0.6
    
    house = amount * HOUSE_EDGE["mines"]
    await add_to_jackpot(amount * 0.01)
    if not hit_mine:
        payout = (amount * multiplier) - house
        profit = payout - amount
        win = True
    else:
        payout = 0
        profit = -amount
        win = False
        await add_house_earnings("mines", amount)
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one({"wallet_address": wallet}, {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}})
    return {"success": True, "game": "mines", "mines": num_mines, "picks": safe_picks, "multiplier": multiplier, "hit_mine": hit_mine, "win": win, "payout": round(payout, 4)}

@router.post("/game/plinko")
async def play_plinko(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    rows = 12
    position = 6
    path = []
    for _ in range(rows):
        direction = random.choice([-1, 1])
        position += direction
        position = max(0, min(12, position))
        path.append(position)
    
    multipliers = [100, 25, 10, 5, 2, 0.5, 0.2, 0.5, 2, 5, 10, 25, 100]
    slot = min(position, len(multipliers) - 1)
    multi = multipliers[slot]
    
    house = amount * HOUSE_EDGE["plinko"]
    await add_to_jackpot(amount * 0.01)
    win = multi > 1
    if multi > 0:
        payout = (amount * multi) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
    if not win:
        await add_house_earnings("plinko", amount * (1 - multi) if multi < 1 else 0)
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one({"wallet_address": wallet}, {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}})
    return {"success": True, "game": "plinko", "path": path, "slot": slot, "multiplier": multi, "win": win, "payout": round(payout, 4)}

@router.post("/game/tower")
async def play_tower(request: GameRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    floors_to_climb = max(1, min(10, int(request.choice or "5")))
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    doors_per_floor = 3
    safe_doors_per_floor = 2
    floors_cleared = 0
    hit_trap = False
    floor_results = []
    
    for f in range(floors_to_climb):
        trap_door = random.randint(0, doors_per_floor - 1)
        chosen_door = random.randint(0, doors_per_floor - 1)
        if chosen_door == trap_door:
            hit_trap = True
            floor_results.append({"floor": f + 1, "chosen": chosen_door, "trap": trap_door, "safe": False})
            break
        else:
            floors_cleared += 1
            floor_results.append({"floor": f + 1, "chosen": chosen_door, "trap": trap_door, "safe": True})
    
    multiplier = round(1.5 ** floors_cleared, 2) if floors_cleared > 0 else 0
    
    house = amount * HOUSE_EDGE["tower"]
    await add_to_jackpot(amount * 0.01)
    win = not hit_trap
    if win and multiplier > 0:
        payout = (amount * multiplier) - house
        profit = payout - amount
    else:
        payout = 0
        profit = -amount
        await add_house_earnings("tower", amount)
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one({"wallet_address": wallet}, {"$inc": {"game_stats.wins": 1 if win else 0, "game_stats.losses": 0 if win else 1, "game_stats.profit": profit}})
    return {"success": True, "game": "tower", "floors_target": floors_to_climb, "floors_cleared": floors_cleared, "multiplier": multiplier, "floor_results": floor_results, "win": win, "payout": round(payout, 4)}


# ============ SPECIAL FEATURES ============

@router.post("/game/leverage")
async def play_leverage(request: LeverageRequest):
    wallet = request.wallet_address.lower()
    amount = request.amount
    direction = request.direction.lower()
    leverage = request.leverage
    
    if direction not in ["long", "short"]:
        return {"success": False, "error": "Choose long or short"}
    if leverage not in [10, 25, 50, 100]:
        return {"success": False, "error": "Leverage must be 10, 25, 50, or 100"}
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    # Simulate price movement (-10% to +10%)
    price_change = random.uniform(-0.10, 0.10)
    
    # Apply leverage
    pnl_percent = price_change * leverage
    if direction == "short":
        pnl_percent = -pnl_percent
    
    # Liquidation check
    liquidated = pnl_percent <= -1.0  # -100% = liquidated
    
    house = amount * HOUSE_EDGE["leverage"]
    await add_to_jackpot(amount * 0.01)
    
    if liquidated:
        payout = 0
        profit = -amount
        await add_house_earnings("leverage", amount)
    else:
        raw_payout = amount * (1 + pnl_percent)
        payout = max(0, raw_payout - house)
        profit = payout - amount
        if profit < 0:
            await add_house_earnings("leverage", abs(profit))
    
    await update_balance(wallet, -amount + payout)
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"game_stats.wins": 1 if profit > 0 else 0, "game_stats.losses": 1 if profit < 0 else 0, "game_stats.profit": profit}}
    )
    
    return {
        "success": True, "game": "leverage", "direction": direction, "leverage": leverage,
        "price_change": round(price_change * 100, 2), "pnl_percent": round(pnl_percent * 100, 2),
        "liquidated": liquidated, "payout": round(payout, 4)
    }

@router.post("/daily-wheel")
async def spin_daily_wheel(request: WalletRequest):
    wallet = request.wallet_address.lower()
    miner = await get_user(wallet)
    if not miner:
        return {"success": False, "error": "Not registered"}
    
    if miner.get("last_daily_wheel"):
        last = datetime.fromisoformat(miner["last_daily_wheel"])
        if datetime.now(timezone.utc) < last + timedelta(hours=24):
            return {"success": False, "error": "Come back tomorrow!"}
    
    # Weighted selection
    weights = [p["weight"] for p in DAILY_WHEEL]
    prize = random.choices(DAILY_WHEEL, weights=weights)[0]
    
    await db.miners.update_one(
        {"wallet_address": wallet},
        {"$inc": {"balance": prize["prize"]}, "$set": {"last_daily_wheel": datetime.now(timezone.utc).isoformat()}}
    )
    
    return {"success": True, "prize": prize["prize"], "label": prize["label"]}

@router.post("/mystery-box")
async def open_mystery_box(request: MysteryBoxRequest):
    wallet = request.wallet_address.lower()
    box_type = request.box_type.lower()
    
    if box_type not in MYSTERY_BOXES:
        return {"success": False, "error": "Invalid box type"}
    
    box = MYSTERY_BOXES[box_type]
    miner = await get_user(wallet)
    if not miner or miner["balance"] < box["cost"]:
        return {"success": False, "error": "Insufficient balance"}
    
    prize = random.choices(box["prizes"], weights=box["weights"])[0]
    profit = prize - box["cost"]
    
    await update_balance(wallet, -box["cost"] + prize)
    await add_house_earnings("mysterybox", box["cost"] - prize if prize < box["cost"] else 0)
    
    return {"success": True, "box": box_type, "cost": box["cost"], "prize": prize, "profit": profit}

@router.get("/jackpot")
async def get_jackpot():
    jackpot = await db.jackpot.find_one({"active": True}, {"_id": 0})
    return {"success": True, "pool": jackpot["pool"] if jackpot else 0}

# ============ TOURNAMENTS ============

@router.get("/tournament/current")
async def get_tournament():
    tournament = await db.tournaments.find_one({"status": "active"}, {"_id": 0})
    if not tournament:
        tournament = {
            "tournament_id": generate_code(),
            "entry_fee": 50,
            "prize_pool": 0,
            "players": [],
            "status": "active",
            "ends_at": (datetime.now(timezone.utc) + timedelta(days=3)).isoformat()
        }
        await db.tournaments.insert_one(tournament)
    return {"success": True, "tournament": tournament}

@router.post("/tournament/join")
async def join_tournament(request: TournamentJoinRequest):
    wallet = request.wallet_address.lower()
    
    tournament = await db.tournaments.find_one({"tournament_id": request.tournament_id, "status": "active"}, {"_id": 0})
    if not tournament:
        return {"success": False, "error": "Tournament not found"}
    
    if wallet in tournament.get("players", []):
        return {"success": False, "error": "Already joined"}
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < tournament["entry_fee"]:
        return {"success": False, "error": "Insufficient balance"}
    
    await update_balance(wallet, -tournament["entry_fee"])
    await db.tournaments.update_one(
        {"tournament_id": request.tournament_id},
        {"$push": {"players": wallet}, "$inc": {"prize_pool": tournament["entry_fee"]}}
    )
    
    return {"success": True, "message": "Joined tournament!"}

# ============ STAKING ============

@router.post("/stake")
async def stake(request: StakeRequest):
    wallet = request.wallet_address.lower()
    pool = request.pool.lower()
    amount = request.amount
    
    if pool not in STAKING_POOLS:
        return {"success": False, "error": "Invalid pool"}
    if amount < 10:
        return {"success": False, "error": "Minimum 10 $GANG"}
    
    miner = await get_user(wallet)
    if not miner or miner["balance"] < amount:
        return {"success": False, "error": "Insufficient balance"}
    
    pool_info = STAKING_POOLS[pool]
    stake_id = generate_code()
    unlock = datetime.now(timezone.utc) + timedelta(days=pool_info["days"])
    reward = amount * (pool_info["apy"] / 100) * (pool_info["days"] / 365)
    
    await update_balance(wallet, -amount)
    await db.stakes.insert_one({
        "stake_id": stake_id, "wallet_address": wallet, "pool": pool,
        "amount": amount, "reward": reward, "status": "active",
        "staked_at": datetime.now(timezone.utc).isoformat(),
        "unlocks_at": unlock.isoformat()
    })
    
    return {"success": True, "stake_id": stake_id, "amount": amount, "reward": round(reward, 4), "unlocks_at": unlock.isoformat()}

@router.post("/unstake")
async def unstake(request: UnstakeRequest):
    wallet = request.wallet_address.lower()
    stake = await db.stakes.find_one({"stake_id": request.stake_id, "wallet_address": wallet, "status": "active"}, {"_id": 0})
    
    if not stake:
        return {"success": False, "error": "Stake not found"}
    
    if datetime.now(timezone.utc) < datetime.fromisoformat(stake["unlocks_at"]):
        return {"success": False, "error": "Still locked"}
    
    total = stake["amount"] + stake["reward"]
    await update_balance(wallet, total)
    await db.stakes.update_one({"stake_id": request.stake_id}, {"$set": {"status": "completed"}})
    
    return {"success": True, "amount": stake["amount"], "reward": stake["reward"], "total": round(total, 4)}

# ============ ADMIN ============

@router.get("/admin/earnings")
async def admin_earnings():
    earnings = await db.house_earnings.aggregate([
        {"$group": {"_id": "$type", "total": {"$sum": "$amount"}}}
    ]).to_list(100)
    total = sum(e["total"] for e in earnings)
    return {"success": True, "by_type": {e["_id"]: round(e["total"], 4) for e in earnings}, "total": round(total, 4)}

@router.get("/admin/withdrawals")
async def admin_withdrawals():
    withdrawals = await db.withdrawal_requests.find({"status": "pending"}, {"_id": 0}).to_list(100)
    return {"success": True, "withdrawals": withdrawals}
