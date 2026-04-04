# Cronos Gangsters DApp — PRD

## Original Problem Statement
Build a complete Web3 DApp for the $GANG token on Cronos chain with DEX features, Telegram bot, mining hub, leverage trading, NFT marketplace, lottery, and token creator.

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~16k+ lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)

## What's Been Implemented

### Session 6 — April 4, 2026

**GANG FUTURES Bug Fixes:**
- Fixed TradingView chart using correct `p.tv` symbol for all pairs
- Added Yahoo Finance backend proxy (`/api/futures/prices`) with 30s cache for all 33 pairs
- Backend proxy serves as primary price source (avoids CORS issues)

**GANG FUTURES Logo & UI Overhaul:**
- Added logos to ALL 33 tradeable pairs (CoinGecko for crypto, TradingView SVGs for stocks/indices/commodities)
- Redesigned pair selector buttons with inline logos
- Chart header shows pair logo, name, type badge, price, and % change
- Added "HOW TO TRADE LEVERAGE" FAQ section (5-step guide + Fees table)

**Hamburger Navigation Redesign:**
- Replaced flat text link dump with proper vertical dropdown panel
- Full-screen dark overlay backdrop with blur
- Each nav item has a unique matching SVG icon
- Items grouped by category: TRADE, EARN, ASSETS, TOOLS, INFO
- Subtle dividers between groups
- Color-coded featured items (Futures orange, Tracker cyan, Lottery gold)
- Scrollable panel for mobile screens
- Closes on item click or clicking outside

### Previous Sessions
- Hamburger menu, 0.3% swap fee, Telegram bot fix
- Limit Orders, Leaderboard, Burn Tracker, Portfolio P&L
- GANG TRACKER multi-chain scanner, GANG FUTURES leverage trading

## Deployment
- User hosts on GoDaddy (uploads HTML file manually)
- Download: `cronos-gangsters-latest.zip`

## Backlog
- P0: Deploy to GoDaddy and verify
- P1: Activate 0.05% protocol fee via Revenue page
- P2: Verify smart contracts on CronoScan
- P2: Monitor GANG TRACKER RPC rate limits
