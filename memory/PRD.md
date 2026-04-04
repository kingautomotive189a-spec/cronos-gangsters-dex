# Cronos Gangsters DApp — PRD

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~17k+ lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Deployment: User downloads ZIP, uploads HTML to GoDaddy manually

## What's Been Implemented

### Session 8 — April 5, 2026

**GANG LENDING & BORROWING (NEW):**
- 4 lending pools: CRO (4.2% APY), GANG (8.5% APY), USDC (3.8% APY), WETH (2.1% APY)
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
- Feature grid with ALL 23 features linked
- GANG FUTURES, GANG TRACKER, DexScreener chart
- All fees 0.3%, leverage 5x/10x/15x/20x
- Revenue page with fee banners for all income sources

## Backlog
- P0: Deploy to GoDaddy
- P1: Monitor GANG TRACKER RPC rate limits
- P1: Verify BuyBot alerts in Telegram
- P2: Phase 9: Limit Orders, Mobile App, DAO Governance
