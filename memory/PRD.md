# Cronos Gangsters DApp — PRD

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~18.5k+ lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Deployment: User downloads ZIP, uploads HTML to GoDaddy manually

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
10. HTML Roadmap page update

## What's Been Implemented

### Session 10 — April 5, 2026

**FLASH LOANS (NEW):**
- Full page with token selector (CRO, GANG, USDC, WETH, WCRO, VVS)
- 0.3% fee per flash loan, zero collateral, strategies (Arbitrage, Liquidation, Collateral Swap, Self-Liquidation)
- Fee preview, recent flash loans list, HOW IT WORKS guide
- Owner panel with COLLECT FLASH LOAN FEES
- Revenue banner: FLASH LOAN FEES (0.3% PER LOAN) + COLLECT button
- Revenue summary tile: FLASH LOANS 0.3%
- HOW YOU EARN entry, Ticker, Grid, Nav, Telegram (/flashloans + callback), Roadmap

**INSURANCE PROTOCOL (NEW):**
- Full page with 5 coverage pools (Smart Contract 2.5%, Depeg 3%, Hack 4%, Rug Pull 5%, Full 5%)
- Buy coverage form with type, amount, duration (1-12 months), discount tiers
- Active policies list, premium calculator
- Owner panel with COLLECT INSURANCE PREMIUMS
- Revenue banner: INSURANCE PREMIUMS (2-5% OF COVERAGE) + COLLECT button
- Revenue summary tile: INSURANCE 2-5%
- HOW YOU EARN entry, Ticker, Grid, Nav, Telegram (/insurance + callback), Roadmap

**PREDICTION MARKETS (completed from previous session):**
- All integration points wired (nav, ticker, grid, revenue, telegram)

### Previous Sessions
- Lending & Borrowing (10 tokens), GANG Futures (33 pairs), GANG Tracker
- Mobile responsive, theme lightened, 0.3% fees everywhere
- Swap, Liquidity, Farms, Vaults, Staking, NFTs, Marketplace, Bridge, Lottery, Launchpad, Token Creator, LP Locker, Referral, Sniper, Portfolio, Leaderboard, Roadmap, FAQ, Contracts

## All Revenue Banners (17 total)
1. Swap Fees (0.3%) — auto-collected
2. GANG Futures (0.3% open + close) — GO TO FUTURES → WITHDRAW
3. Leverage Trading (0.3%) — retained in house pool
4. Lending Interest (20%) + Origination (0.3%) + Liquidation (5%) — COLLECT
5. Prediction Markets (5% pot) — COLLECT PREDICTION FEES
6. Flash Loans (0.3%) — COLLECT FLASH LOAN FEES
7. Insurance Premiums (2-5%) — COLLECT INSURANCE PREMIUMS
8. Vault Performance Fees — COLLECT VAULT FEES
9. NFT Mints (50 CRO) — WITHDRAW NFT CRO
10. NFT Marketplace (2.5%) — COLLECT MARKETPLACE FEES
11. Staking Early Exit (25%) — auto-sent
12. Referral Pool — EMERGENCY WITHDRAW
13. Token Creator (25-500 CRO) — auto-sent
14. Launchpad (3%) — auto-collected on finalize
15. LP Locker (1 CRO) — COLLECT LOCKER FEES
16. Lottery (10%) — COLLECT LOTTERY FEES
17. Sniper Bot (1%) — auto-sent

## Backlog
- P0: Deploy latest ZIP to GoDaddy
- P1: Copy Trading feature
- P1: Revenue-Sharing Staking feature
- P2: Limit Orders, Mobile App, DAO Governance
- P2: DEX Aggregator, OTC Trading Desk
