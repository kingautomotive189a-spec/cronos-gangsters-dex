# Cronos Gangsters DApp — PRD

## Original Problem Statement
Build a complete Web3 DApp for the $GANG token on Cronos chain with DEX features (swap, liquidity, farms, vaults, staking), a Telegram community bot, mining hub, leverage trading, NFT marketplace, lottery, and token creator.

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~16k+ lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Smart Contracts: MasterChef, Staking, Lottery (Solidity)

## What's Been Implemented

### Session 6 — April 4, 2026

**GANG FUTURES Bug Fixes:**
- Fixed TradingView chart: was hardcoding `BINANCE:` prefix for all pairs — now uses correct `p.tv` symbol
- Fixed price feed: Added Yahoo Finance backend proxy (`/api/futures/prices`) with 30s cache
- Added Yahoo Finance ticker mapping for all 33 pairs (crypto + stocks + indices + commodities)
- Backend proxy serves as primary price source for ALL assets (avoids CORS issues)
- Binance/CoinGecko kept as client-side fallbacks for crypto
- CORS proxy fallbacks for standalone HTML deployments
- Fixed empty emoji on close position toast message

**GANG FUTURES Logo & UI Overhaul:**
- Added logos to ALL 33 tradeable pairs using TradingView CDN + CoinGecko
  - Crypto: CoinGecko coin images (BTC, ETH, SOL, etc.)
  - Stocks: TradingView SVG logos (AAPL, TSLA, NVDA, MSFT, AMZN, etc.)
  - Indices: US flag icons (NASDAQ 100, S&P 500, DOW JONES)
  - Commodities: TradingView commodity icons (Gold, Silver, Crude Oil, Natural Gas)
- Redesigned pair selector buttons with inline logos and cleaner styling
- Chart header now shows pair logo, name, type badge, price, and % change
- Added "HOW TO TRADE LEVERAGE" FAQ section with 5-step guide + Fees & Limits table
- All logos have CSS fallback badges (colored circles with initials) if images fail

### Previous Sessions (3-5)
- Collapsible hamburger menu navigation
- 0.3% Platform Fee on Swap
- Telegram Bot fix (SIGTERM handling)
- Limit Orders panel
- Leaderboard + Points System
- Token Burn Tracker
- Portfolio P&L Tracker
- GANG TRACKER multi-chain wallet scanner
- GANG FUTURES leverage trading platform

## Deployment
- User hosts on GoDaddy (uploads HTML file manually)
- Backend runs on Emergent platform
- Download links: `cronos-gangsters-latest.zip` (HTML only), `cronos-gangsters-full-package.zip` (full)

## Backlog
- P0: User to deploy updated file to GoDaddy and verify
- P1: User to activate 0.05% protocol fee via Revenue page button
- P2: Verify smart contracts on CronoScan
- P2: Monitor public RPC rate limits on GANG TRACKER under heavy usage
