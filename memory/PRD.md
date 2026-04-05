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

### MAX Buttons & Balance Displays (Feb 5, 2026)
- MAX button on ALL input fields across all features
- Balance/staked amount displays showing available amounts

### Phase 10 — Dynamic Copy Trading + Global Auto-Refresh (Feb 5, 2026)
- **Dynamic Copy Trading** — Linked to real `futuresState.positions` from Leverage page
- **Global Auto-Refresh Engine** — Charts, balances, PnL auto-update every 3-15s
- **Live Indicators** — Green pulsing dots on active pages
- **Value Pulse Animations** — CSS flash on value changes

### Phase 10b — Professional Copy Trading UI (Feb 5, 2026)
- **Proper token logos** — BTC, ETH, SOL, TSLA, NVDA, GOLD, AAPL, etc. pulled from FUTURES_PAIRS (CoinGecko + TradingView CDN)
- **Rank badges** — #1 TOP (gold), #2 (silver), #3 (bronze) for top PnL traders
- **Asset type badges** — STOCK, INDEX, COMDTY labels on non-crypto assets
- **Entry vs Current price** displayed live on each card
- **Trader wallet addresses** shown professionally (0x7a25...488D)
- **Popup shows token logo** — BTC logo in the 3-stage confirmation modal
- **Selected trade panel** shows logo + full pair name (e.g., BTC/USD)
- **Copy history** shows logos next to each historical copy
- **Direction indicator** on logo — green L (long) or red S (short) badge overlay

## Backlog / Phase 11 (Future)
- CEX listings
- Multi-chain expansion (ETH, BSC)
- Mobile App (iOS & Android)
- Gangster NFT Gallery with rarity & trait filters
- Top Collections leaderboard

## Testing Status
- Iteration 6: 100% pass (14/14 tests)
- Iteration 7: 92% pass → fixed duplicate function bug
- Phase 10/10b: Manual screenshot tests — Copy Trading logos, popups, PnL, auto-refresh all verified

## Key Files
- `/app/frontend/public/cronos-gangsters.html` — Main DApp (~21,400 lines)
- `/app/backend/telegram_bot.py` — Telegram Bot (~3,320 lines)
- `/app/backend/server.py` — FastAPI server
- `/app/frontend/public/cronos-gangsters-deploy.zip` — Lean deployable package
