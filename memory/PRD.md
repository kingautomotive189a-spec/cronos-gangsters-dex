# Cronos Gangsters DApp — PRD

## Original Problem Statement
Build a complete Web3 DApp for the $GANG token on Cronos chain with DEX features (swap, liquidity, farms, vaults, staking), a Telegram community bot, mining hub, leverage trading, NFT marketplace, lottery, and token creator.

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~13,800 lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Smart Contracts: MasterChef, Staking, Lottery (Solidity)

## Session 4 — April 3, 2026

### Lottery Feature
- Removed duplicate page-lottery HTML, fixed broken JS references to deployLotteryBanner
- Lottery contract at 0xd2c46260...f27 with ABI fully injected

### Max Payout
- Added MAX_PAYOUT_MULT = 50 cap for paper trading positions

### Deep Dive Audit + Performance Optimization
**Bugs Fixed:**
- server.py: logger used before defined (crash on errors), "2 warnings" text (should be 3)
- Cloudflare challenge script removed (hidden iframe cruft)
- CRO/USDC Coming Soon farm had wrong LP address (XRP/GANG LP)
- vaultFeeBox display logic: `'block' : 'block'` → `'block' : 'none'`
- 11 `Invalid left-hand side in assignment` JS errors (optional chaining on assignment)
- Telegram bot: stale hardcoded APYs/TVLs, wrong lottery split (90/10 → 70/20/10)

**Performance:**
- Price refresh interval: 5s → 15s (3x fewer API calls)
- DexScreener response caching (15s TTL)
- Farm TVL RPC calls batched with Promise.all (was sequential per-farm)
- Farm APR poolInfo calls batched with Promise.all
- Vault TVL: removed 300ms delays + 1s retry delays per vault, batched all RPC
- All images: loading="lazy" (53 → 119 images)

**Telegram Bot:**
- Live APR/TVL via fetch_live_farm_data() from DexScreener
- Correct lottery info (70% winner, 20% burned, 10% treasury)
- LOTTERY contract address in CONTRACTS dict
- Lottery mentioned in startup + periodic messages

## Backlog
- P2: Verify BuyBot DexScreener polling (buy alert system)
