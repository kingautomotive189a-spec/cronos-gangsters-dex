# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a massive Web3 DApp as a single standalone HTML file for GoDaddy deployment. Features include DeFi protocols (Swap, Lending, Futures, etc.), NFTs, Telegram Bot integration, and revenue collection for the owner.

## Architecture
- **Frontend**: Single `cronos-gangsters.html` file (~21,400 lines), vanilla JS + Ethers.js v6
- **Backend**: FastAPI (`server.py`) + Python Telegram Bot (`telegram_bot.py`)
- **Storage**: LocalStorage (mocked DeFi state), no database
- **Deployment**: User downloads ZIP → uploads to GoDaddy manually

## Completed Features (All Phases 1-10)
### Core DeFi
- Swap, Liquidity, Farms, Vaults, Staking, Lottery
- Token Creator, Launchpad, LP Locker, Sniper Bot
- NFT Minting & Marketplace, Referral System
- GANG Futures, GANG Tracker, Bridge

### Phase 8 — Advanced DeFi
- Lending & Borrowing, Prediction Markets, Flash Loans, Insurance, DEX Aggregator

### Phase 9 — World Domination
- Copy Trading, Revenue-Sharing Staking, Limit Orders, Perpetual DEX, OTC Trading, DAO Governance

### Phase 10 — Dynamic Copy Trading + Auto-Refresh
- Dynamic Copy Trading linked to real Futures positions
- Global auto-refresh engine (all data updates every 3-15s)
- Professional token logos (BTC, ETH, TSLA, NVDA, GOLD, etc.)
- Rank badges (#1 TOP gold, #2 silver, #3 bronze)
- Asset type badges (STOCK, INDEX, COMDTY)
- Popup shows token logo in 3-stage confirmation modal

### Phase 10c — Navigation Menu Overhaul (Feb 5, 2026)
- **Organized into 7 categories**: TRADE, LEVERAGE, EARN, MARKETS, ASSETS, TOOLS, INFO
- **Consistent clean styling** — ALL items white/light text, no rainbow colors
- **Gold left-border accent** on active menu item
- **Subtle descriptions** on key items (e.g., "Up to 100x", "No expiry", "Follow pros", "Earn fees", "Big blocks")
- **Tighter spacing** — more items visible without scrolling
- **Gradient dividers** between categories
- **Dark premium background** with subtle border glow

## Backlog / Phase 11 (Future)
- CEX listings
- Multi-chain expansion (ETH, BSC)
- Mobile App (iOS & Android)
- Gangster NFT Gallery with rarity & trait filters

## Key Files
- `/app/frontend/public/cronos-gangsters.html` — Main DApp (~21,400 lines)
- `/app/backend/telegram_bot.py` — Telegram Bot
- `/app/backend/server.py` — FastAPI server
- `/app/frontend/public/cronos-gangsters-deploy.zip` — Lean deployable package
