# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a massive Web3 DApp as a single standalone HTML file for GoDaddy deployment. Features include DeFi protocols (Swap, Lending, Futures, etc.), NFTs, Telegram Bot integration, and revenue collection for the owner.

## Architecture
- **Frontend**: Single `cronos-gangsters.html` file (~21,500 lines), vanilla JS + Ethers.js v6
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
- Copy Trading linked to real Futures positions with proper token logos
- Global auto-refresh engine for all data

### Navigation Menu Overhaul (Phase 10c)
- Organized into 7 categories: TRADE, LEVERAGE, EARN, MARKETS, ASSETS, TOOLS, INFO

### Professional Token Dropdowns (Phase 10e - Feb 5, 2026)
- Custom dropdown component with token logos replacing all plain HTML selects
- **Lending Borrow dropdown**: 10 tokens with CoinMarketCap logos (CRO, GANG, USDC, WETH, WBTC, DAI, USDT, ATOM, VVS, TONIC)
- **Limit Orders dropdown**: 10 tokens with logos
- **OTC Trading dropdowns**: SELL/BUY prefix with logos for 5 tokens each
- Gold checkmark on active selection, hover effects, dark premium backgrounds

## Backlog / Future
- CEX listings, Multi-chain expansion, Mobile App, NFT Gallery with rarity filters

## Key Files
- `/app/frontend/public/cronos-gangsters.html` — Main DApp (~21,500 lines)
- `/app/backend/telegram_bot.py` — Telegram Bot
- `/app/backend/server.py` — FastAPI server
- `/app/frontend/public/cronos-gangsters-deploy.zip` — Deployable package (12MB)
