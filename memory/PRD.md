# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a massive Web3 DApp as a single standalone HTML file for GoDaddy deployment. Features include DeFi protocols (Swap, Lending, Futures, etc.), NFTs, Telegram Bot integration, and revenue collection for the owner.

## Architecture
- **Frontend**: Single `cronos-gangsters.html` file (~21,000 lines), vanilla JS + Ethers.js v6
- **Backend**: FastAPI (`server.py`) + Python Telegram Bot (`telegram_bot.py`)
- **Storage**: LocalStorage (mocked DeFi state), no database
- **Deployment**: User downloads ZIP → uploads to GoDaddy manually

## Completed Features (All Phases 1-9)
### Core DeFi
- Swap, Liquidity, Farms, Vaults, Staking, Lottery
- Token Creator, Launchpad, LP Locker, Sniper Bot
- NFT Minting & Marketplace, Referral System
- GANG Futures, GANG Tracker, Bridge

### Phase 8 — Advanced DeFi (Completed)
- Lending & Borrowing (20% interest share, 0.3% origination, 5% liquidation)
- Prediction Markets (5% of resolved pots)
- Flash Loans (0.3% fee per loan)
- Insurance Protocol (2-5% premiums)
- DEX Aggregator (0.3% routing fee across 6 DEXs)

### Phase 9 — World Domination (Completed Feb 5, 2026)
- **Copy Trading** — Follow top traders, 0.3% fee per copied trade
- **Revenue-Sharing Staking** — Stake GANG, earn proportional platform fees, 0.3% mgmt fee
- **Limit Orders** — Buy/sell at target price, 0.3% execution fee
- **Perpetual DEX** — No-expiry contracts, up to 50x leverage, 0.3% open/close fee
- **OTC Trading Desk** — Large block trades with escrow, 0.3% per deal
- **DAO Governance** — Create proposals (1 CRO fee), vote with GANG, quorum 10,000

### Custom Transaction Popup — 3-Stage Flow (Feb 5, 2026)
- Stage 1: Transaction details + CANCEL/CONFIRM
- Stage 2: "PROCESSING TRANSACTION" gold spinner (1.5s)
- Stage 3: "TRANSACTION CONFIRMED" green checkmark, tx hash, Cronoscan link, DONE button
- Applied to ALL mocked features

### MAX Buttons & Balance Displays (Feb 5, 2026)
- MAX button on ALL input fields across all features
- Balance/staked amount displays showing available amounts
- Token-specific balance updates when switching tokens
- Applied to: Copy Trading, Revenue Staking, Limit Orders, Perp DEX, OTC Trading, Flash Loans, Lending

## Backlog / Phase 10 (Future)
- CEX listings
- Multi-chain expansion (ETH, BSC)
- Mobile App (iOS & Android)
- Gangster NFT Gallery with rarity & trait filters
- Top Collections leaderboard

## Testing Status
- Iteration 6: 100% pass (14/14 tests, all 6 features)
- Iteration 7: 92% pass → fixed duplicate function bug
- Manual: 100% pass (3-stage popup, MAX buttons, balances verified)

## Key Files
- `/app/frontend/public/cronos-gangsters.html` — Main DApp (~21,000 lines)
- `/app/backend/telegram_bot.py` — Telegram Bot (~3,320 lines)
- `/app/backend/server.py` — FastAPI server
- `/app/frontend/public/cronos-gangsters-package.zip` — Deployable package
