# Cronos Gangsters DApp — PRD

## Original Problem Statement
Build a complete Web3 DApp for the $GANG token on Cronos chain with DEX features, Telegram bot, mining hub, leverage trading, NFT marketplace, lottery, and token creator.

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~16k+ lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Deployment: User downloads ZIP, uploads HTML to GoDaddy manually

## What's Been Implemented

### Session 7 — April 4, 2026

**Telegram Bot Phase 8 Update:**
- Added 3 new commands: `/futures`, `/tracker`, `/roadmap`
- Added GANG FUTURES menu button (33 pairs, dual currency, 0.3% fees, leverage details)
- Added GANG TRACKER menu button (multi-chain scanner, 5 chains)
- Added Roadmap menu button (Phase 1-8 complete, Phase 9 preview)
- Updated `/start` message with Phase 8 features prominently
- Updated `/help` command with new commands at top
- Updated `/shill` promo message with Phase 8 features
- Updated bot startup message with Phase 8 announcement
- Updated periodic price update message with GANG FUTURES & TRACKER
- Standardized all fee references to 0.3% (was 0.1% in trading)
- Updated FAQ callback with fee & futures info
- Updated server.py bot commands list (32 total commands)
- All new callback handlers registered in CALLBACK_DISPATCH

### Session 6 — April 4, 2026

**GANG FUTURES Bug Fixes:**
- Fixed TradingView chart using correct `p.tv` symbol for all pairs
- Added Yahoo Finance backend proxy (`/api/futures/prices`) with 30s cache for all 33 pairs

**GANG FUTURES Logo & UI Overhaul:**
- Added logos to ALL 33 tradeable pairs
- Redesigned pair selector buttons with inline logos
- Chart header shows pair logo, name, type badge, price, and % change
- Added "HOW TO TRADE LEVERAGE" FAQ section

**Hamburger Navigation Redesign:**
- Replaced flat text link dump with proper vertical dropdown panel
- Full-screen dark overlay backdrop with blur
- Each nav item has a unique matching SVG icon
- Items grouped by category: TRADE, EARN, ASSETS, TOOLS, INFO

**DexScreener Live Chart:**
- Embedded multi-coin selector (BTC, ETH, SOL, CRO, GANG & more)

**Fee Standardization:**
- All platform fees locked to exactly 0.3% (Swap, Futures Open, Futures Close, LP)

**Dual Currency Futures:**
- Traders choose between GANG or CRO to trade with
- Owner has separate pools for both currencies

**Roadmap Update:**
- Phase 8 completed features added to frontend HTML

### Previous Sessions
- Hamburger menu, 0.3% swap fee, Telegram bot fix
- Limit Orders, Leaderboard, Burn Tracker, Portfolio P&L
- GANG TRACKER multi-chain scanner, GANG FUTURES leverage trading

## Backlog
- P0: Deploy latest to GoDaddy and verify (user action)
- P0: Monitor GANG TRACKER RPC rate limits when live
- P1: Verify BuyBot DexScreener polling is correct
- P1: Activate 0.05% protocol fee via Revenue page
- P2: Verify smart contracts on CronoScan
