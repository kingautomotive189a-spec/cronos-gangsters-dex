# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a massive Web3 DApp as a single standalone HTML file for GoDaddy deployment.

## Architecture
- **Frontend**: Single `cronos-gangsters.html` (~21,500 lines), vanilla JS + Ethers.js v6
- **Backend**: FastAPI (`server.py`) + Python Telegram Bot (`telegram_bot.py`)
- **Storage**: LocalStorage (mocked DeFi state)
- **Deployment**: ZIP download → GoDaddy manual upload

## All Completed Features

### Core: Swap, Liquidity, Farms, Vaults, Staking, Lottery, Token Creator, Launchpad, LP Locker, Sniper Bot, NFTs, Referral, Futures, Tracker, Bridge

### Advanced DeFi: Lending & Borrowing, Prediction Markets, Flash Loans, Insurance, DEX Aggregator

### World Domination: Copy Trading (0.3%), Revenue Staking (0.3%), Limit Orders (0.3%), Perpetual DEX (0.3%), OTC Trading (0.3%), DAO Governance (1 CRO)

### Dynamic Copy Trading + Auto-Refresh (Phase 10)
- Copy Trading linked to real Futures positions with proper token logos
- Global auto-refresh engine (3-15s intervals)

### Navigation Menu Overhaul (Phase 10c)
- 7 categories: TRADE, LEVERAGE, EARN, MARKETS, ASSETS, TOOLS, INFO

### Professional Token Dropdowns (Phase 10e)
- Custom dropdowns with CoinMarketCap logos for Lending, Limit Orders, OTC

### Pre-Seeded Lending Pools (Phase 10f - Feb 5, 2026)
- All 10 lending pools pre-seeded with realistic liquidity and borrowing
- CRO 3.2% APY (125K supplied, 54% util), GANG 9.0% APY (2.5M, 70% util), USDC 2.7% APY (85K, 61% util), WETH 1.3% APY (42, 43% util), WBTC 0.7% APY, DAI, USDT, ATOM, VVS, TONIC all active
- Total Supplied ~$696K, Total Borrowed ~$325K
- Auto-seeds on first visit, preserves user balances on subsequent visits

## Backlog / Future
- CEX listings, Multi-chain expansion, Mobile App, NFT Gallery

## Key Files
- `/app/frontend/public/cronos-gangsters.html` — Main DApp
- `/app/frontend/public/cronos-gangsters-deploy.zip` — Deployable package (12MB)
