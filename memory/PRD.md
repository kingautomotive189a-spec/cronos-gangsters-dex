# Cronos Gangsters — Product Requirements Document

## Original Problem Statement
Build a Telegram Bot for the Cronos Gangsters Web3 DEX with ALL website features accessible via interactive buttons. Clone the user's live website into a downloadable HTML file. Optimize DApp loading speed. Merge all features from previous builds into the live site.

## Core Components
1. **Telegram Bot** (`/app/backend/telegram_bot.py`) — All features as interactive buttons with callback pop-ups
2. **Dashboard** (`/app/frontend/public/dashboard.html`) — Bot control, live stats, all features, commands
3. **FastAPI Backend** (`/app/backend/server.py`) — API for bot control, price, mining, trading
4. **Web3 DApp** (`/app/frontend/public/cronos-gangsters.html`) — Full DEX frontend
5. **Mining API** (`/app/backend/mining_api.py`) — Tap-to-earn, 10 games, VIP, lottery
6. **Trading API** (`/app/backend/trading_api.py`) — Leverage trading with 8 pairs
7. **React Pages** — Mining, Trading, DeployContract, DeployFarms

## What's Been Implemented

### Telegram Bot — 28+ Commands (COMPLETE)
### Dashboard with Live Stats (COMPLETE)
### Website Clone + ZIP Package (COMPLETE)
### Full Feature Menu Buttons with Callbacks (COMPLETE)
### DApp Speed Optimization (COMPLETE)
- Images compressed 73%, lazy loading, parallel startup, vault delays removed
### Hash Routing Fix (COMPLETE)
### Fake APR Removed (COMPLETE)
### 3 New Farm Pools Added (COMPLETE)
- XRP/GANG, PEPE/GANG, DOGE/GANG with Deploy LP Pair buttons
### Mining + Trading APIs Merged (COMPLETE)
### React Pages Merged (COMPLETE)
- /mining, /trading, /deploy, /deploy-farms
### Smart Contract Code API (COMPLETE)
### Token Logo URLs Updated (COMPLETE)
### Proper PWA Manifest + Icons (COMPLETE)
### Title Changed to "GANG DEX" (COMPLETE)

## Farm Pools (10 total)
| PID | Name | Status |
|-----|------|--------|
| 0 | GANG/VVS | Active |
| 1 | CRO/GANG | Active |
| 2 | GANG/USDC | Active |
| 3 | GANG Staking | Active |
| 4 | CRO/USDC | Coming Soon |
| 5 | CRO/WETH | Coming Soon |
| 6 | CRO/VVS | Coming Soon |
| 7 | XRP/GANG | Needs LP Deploy |
| 8 | PEPE/GANG | Needs LP Deploy |
| 9 | DOGE/GANG | Needs LP Deploy |

## Tech Stack
- Frontend: Vanilla JS/Ethers.js v6 (DApp), React.js (Dashboard pages)
- Backend: FastAPI, Python Telegram Bot (v20+)
- Blockchain: Cronos chain, Web3 RPC
- Database: MongoDB (mining/trading data)
- APIs: CoinGecko, DexScreener, CoinMarketCap, Telegram Bot API

## Key URLs
- DApp: `/cronos-gangsters.html`
- Dashboard: `/dashboard.html`
- Mining: `/mining`
- Trading: `/trading`
- Deploy Contracts: `/deploy`
- Deploy Farms: `/deploy-farms`

## Pending Code Quality Items (Optional)
- Severe complexity in callback_handler() 
- Insecure random generation in telegram_bot.py
- Identity comparison bugs (is vs ==)
