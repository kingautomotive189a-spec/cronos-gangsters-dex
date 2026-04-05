# Cronos Gangsters DApp — PRD

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~19.2k+ lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Deployment: User downloads ZIP, uploads HTML to GoDaddy manually

## Standard Checklist for Every New Feature
Every feature MUST include:
1. Nav button in sidebar (with unique SVG icon)
2. Scrolling ticker entry (both copies)
3. Feature grid box
4. Revenue page summary tile
5. Revenue page fee collection banner with COLLECT button
6. "HOW YOU EARN" entry
7. Telegram bot command + callback
8. Telegram main keyboard button
9. Telegram roadmap update (both command + callback)
10. HTML Roadmap page update
11. Transaction Confirmation Modal on all action buttons

## Transaction Confirmation Modal
Global wallet-style confirmation popup on ALL action buttons:
- Flash Loans (Execute Flash Loan)
- Insurance (Buy Coverage)
- DEX Aggregator (Swap Via Best Route)
- Prediction Markets (Place Bet)
- Lending (Supply, Withdraw, Borrow, Repay)
- Futures (Open Position, Close Position)
- Shows: Action, Amount, Platform Fee, You Receive, extra details
- CANCEL / CONFIRM buttons
- "SECURED BY CRONOS BLOCKCHAIN" badge
- Color-coded per feature (gold/teal/pink/purple/cyan/green/red)

## All Revenue Banners (18 total)
1. Swap Fees (0.3%) — auto-collected
2. GANG Futures (0.3% open + close) — WITHDRAW PROFIT
3. Leverage Trading (0.3%) — retained in house pool
4. Lending Interest (20%) + Origination (0.3%) + Liquidation (5%) — COLLECT
5. Prediction Markets (5% pot) — COLLECT PREDICTION FEES
6. Flash Loans (0.3%) — COLLECT FLASH LOAN FEES
7. Insurance Premiums (2-5%) — COLLECT INSURANCE PREMIUMS
8. DEX Aggregator (0.3% routing) — COLLECT AGGREGATOR FEES
9. Vault Performance Fees — COLLECT VAULT FEES
10. NFT Mints (50 CRO) — WITHDRAW NFT CRO
11. NFT Marketplace (2.5%) — COLLECT MARKETPLACE FEES
12. Staking Early Exit (25%) — auto-sent
13. Referral Pool — EMERGENCY WITHDRAW
14. Token Creator (25-500 CRO) — auto-sent
15. Launchpad (3%) — auto-collected on finalize
16. LP Locker (1 CRO) — COLLECT LOCKER FEES
17. Lottery (10%) — COLLECT LOTTERY FEES
18. Sniper Bot (1%) — auto-sent

## 28 Features Built
Swap, Liquidity, Farms, Vaults, Staking, Lottery, NFT Minting, NFT Marketplace, Bridge, Launchpad, Token Creator, LP Locker, Sniper Bot, Referral, Portfolio, Leaderboard, GANG Tracker, GANG Futures (33 pairs), Lending & Borrowing (10 tokens), Prediction Markets, Flash Loans, Insurance Protocol, DEX Aggregator, DexScreener Chart, Roadmap, FAQ, Contracts, Revenue Page

## Testing
- Testing agent iteration 5: 100% pass (18/18 tests, 0 bugs)
- Confirmation modal testing: 3/3 popups working, zero console errors
- All 28 pages navigate correctly, 30 nav buttons, 29 SVG icons

## Backlog
- P0: Deploy latest ZIP to GoDaddy
- P1: Copy Trading feature
- P1: Revenue-Sharing Staking feature
- P2: Perpetual DEX / Options
- P2: OTC Trading Desk
- P2: DAO Governance
- P2: Limit Orders
