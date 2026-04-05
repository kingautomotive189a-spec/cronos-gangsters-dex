# Cronos Gangsters DApp — PRD

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~18k+ lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Deployment: User downloads ZIP, uploads HTML to GoDaddy manually

## What's Been Implemented

### Session 9 — April 5, 2026

**PREDICTION MARKETS (NEW):**
- 10 default markets: Crypto (BTC, ETH, CRO, GANG), Stocks (TSLA, NVDA, AAPL), Sports (UCL, NBA), Politics
- 5 category tabs: ALL, CRYPTO, STOCKS, SPORTS, POLITICS, CUSTOM
- Create custom markets with question, options, end date
- Place bets with CRO, real-time odds adjustment
- Owner resolves markets, 5% platform fee on every pot
- Owner panel with fee collection on Predictions page
- Revenue page: PREDICTIONS 5% summary tile + full banner with COLLECT button
- "HOW YOU EARN" section updated with Prediction Markets line
- Added to scrolling ticker (both copies): "PREDICTION MARKETS — BET & WIN"
- Added to feature grid: PREDICT box with purple accent
- Nav button: Predictions in sidebar
- Telegram bot: /predictions command + menu_predictions callback
- Telegram roadmap updated with Prediction Markets
- Telegram main keyboard: Predictions button added
- Page init on navigate: renderPredMarkets() called on page switch

### Session 8 — April 5, 2026

**GANG LENDING & BORROWING:**
- 10 lending pools: CRO, GANG, USDC, WETH, WCRO, VVS, TONIC, ATOM, SHIB, DOGE
- Supply tokens to earn interest, borrow against collateral (75% LTV)
- Variable interest rates based on utilization (Aave-style curve)
- Health factor display with liquidation warning
- Owner earns: 20% of interest + 0.3% origination fee + 5% liquidation penalty
- Owner collection panel on lending page
- Revenue page banner for lending fees
- Telegram bot: /lending command + menu button + callback
- Added to scrolling ticker, feature grid, nav menu

### Previous Sessions
- Mobile responsive overhaul (3-tier breakpoints)
- Theme lightened to navy palette
- Scrolling ticker with ALL features clickable
- Feature grid with ALL 24+ features linked
- GANG FUTURES, GANG TRACKER, DexScreener chart
- All fees 0.3%, leverage 5x/10x/15x/20x
- Revenue page with fee banners for all income sources
- Swap, Liquidity, Farms, Vaults, Staking, NFTs, Marketplace, Bridge, Lottery, Launchpad, Token Creator, LP Locker, Referral, Sniper, Portfolio, Leaderboard, Roadmap, FAQ, Contracts

## Standard Checklist for Every New Feature
Every feature MUST include:
1. Nav button in sidebar
2. Scrolling ticker entry (both copies)
3. Feature grid box
4. Revenue page summary tile
5. Revenue page fee collection banner with COLLECT button
6. "HOW YOU EARN" entry
7. Telegram bot command + callback
8. Telegram main keyboard button
9. Telegram roadmap update

## Backlog
- P0: Deploy latest ZIP to GoDaddy
- P1: Copy Trading feature
- P1: Revenue-Sharing Staking feature
- P2: Phase 9: Limit Orders, Mobile App, DAO Governance
