# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a massive Web3 DApp as a single standalone HTML file for GoDaddy deployment. Features include DeFi protocols (Swap, Lending, Futures, etc.), NFTs, Telegram Bot integration, and revenue collection for the owner.

## Architecture
- **Frontend**: Single `cronos-gangsters.html` file (~21,400 lines), vanilla JS + Ethers.js v6
- **Backend**: FastAPI (`server.py`) + Python Telegram Bot (`telegram_bot.py`)
- **Storage**: LocalStorage (mocked DeFi state), no database
- **Deployment**: User downloads ZIP → uploads to GoDaddy manually

## Completed Features

### Core DeFi
- Swap, Liquidity, Farms, Vaults, Staking, Lottery, Token Creator, Launchpad, LP Locker, Sniper Bot, NFT Minting & Marketplace, Referral System, GANG Futures, GANG Tracker, Bridge

### Advanced DeFi (Phase 8)
- Lending & Borrowing, Prediction Markets, Flash Loans, Insurance, DEX Aggregator

### World Domination (Phase 9)
- Copy Trading (0.3%), Revenue Staking (0.3%), Limit Orders (0.3%), Perpetual DEX (0.3%), OTC Trading (0.3%), DAO Governance (1 CRO)

### Dynamic Copy Trading + Auto-Refresh (Phase 10)
- Copy Trading linked to real Futures positions with proper token logos (BTC, ETH, TSLA, NVDA, GOLD, SOL etc.)
- Rank badges (#1 gold, #2 silver, #3 bronze), asset type badges (STOCK, INDEX, COMDTY)
- Global auto-refresh engine: Futures PnL (10s), Copy Trading (5-6s), Perp DEX prices (3s), Revenue Staking rewards (8s), balances (15s)
- Live pulsing green dot indicators, CSS pulse animations on value changes
- 3-stage wallet popup (Confirm → Processing → Confirmed) on all mocked features

### Navigation Menu Overhaul (Phase 10c)
- Organized into 7 categories: TRADE, LEVERAGE, EARN, MARKETS, ASSETS, TOOLS, INFO
- Clean white text, gold category headers, no rainbow colors
- Subtle descriptions on key items, gold left-border accent on active item

### Full Audit (Phase 10d - Feb 5, 2026)
- Verified all 34 page nav buttons match page IDs
- All 12 collect fee functions verified (6 feature + 6 revenue)
- All 6 Revenue page fee banners show correct data
- All key feature pages navigate correctly
- Live prices, marquee banner, stats bar all functional

## Backlog / Future
- CEX listings, Multi-chain expansion, Mobile App, NFT Gallery with rarity filters

## Key Files
- `/app/frontend/public/cronos-gangsters.html` — Main DApp (~21,400 lines)
- `/app/backend/telegram_bot.py` — Telegram Bot
- `/app/backend/server.py` — FastAPI server
- `/app/frontend/public/cronos-gangsters-deploy.zip` — Deployable package (12MB)
