# Cronos Gangsters DApp — PRD

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~19.4k lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Deployment: User downloads ZIP, uploads HTML to GoDaddy manually

## Standard Checklist for Every New Feature
1. Nav button in sidebar (unique SVG icon)
2. Scrolling ticker entry (both copies)
3. Feature grid box
4. Revenue page summary tile
5. Revenue page fee COLLECT banner
6. "HOW YOU EARN" entry
7. Telegram bot command + callback
8. Telegram main keyboard button
9. Telegram roadmap update (both versions)
10. HTML Roadmap page update
11. Transaction Confirmation Modal on all mocked action buttons

## Transaction Confirmation Modal
Custom wallet-style popup on ALL mocked/simulated actions:
- Lending: Supply, Withdraw, Borrow, Repay
- Predictions: Place Bet, Create Market
- Flash Loans: Execute Flash Loan
- Insurance: Buy Coverage
- DEX Aggregator: Swap Via Best Route
- Futures: Open Position, Close Position
- All Owner COLLECT buttons (Predictions, Flash, Insurance, Aggregator)
- All Revenue COLLECT buttons

NOT applied to real on-chain features (Swap, Staking, Lottery, NFT Mint, Farms, Vaults, Bridge, LP Locker, Launchpad, Marketplace, Token Creator) — those use the real wallet popup.

## All Revenue Banners (18 total)
1-18: Swap(0.3%), Futures(0.3%), Leverage(0.3%), Lending(20%+0.3%+5%), Predictions(5%), Flash Loans(0.3%), Insurance(2-5%), Aggregator(0.3%), Vaults, NFTs(50CRO), Marketplace(2.5%), Staking(25%), Referral, Token Creator(25-500CRO), Launchpad(3%), LP Locker(1CRO), Lottery(10%), Sniper(1%)

## Bugs Fixed
- `TK` undefined in `updateLendingUI` → replaced with `token`
- `baseSupplyAPY` property not found → replaced with `baseRate`

## Backlog
- P1: Copy Trading feature
- P1: Revenue-Sharing Staking feature
- P2: Perpetual DEX / Options, OTC Trading, DAO Governance, Limit Orders
