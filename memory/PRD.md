# Cronos Gangsters — PRD

## Original Problem Statement
Ultra-fast vanilla JS DApp for Cronos Gangsters DEX with Telegram bot, mining/casino games, leverage trading, deploy farms, dashboard, and owner revenue collection.

## Architecture
- Frontend: Vanilla JS/HTML standalone pages in /frontend/public/
- Backend: FastAPI + python-telegram-bot (v20+)
- Database: MongoDB (Motor async driver)
- Blockchain: Cronos mainnet via ethers.js v5

## Key Files
- `/frontend/public/cronos-gangsters.html` — Main DApp
- `/frontend/public/mining.html` — Mining Hub + 19 casino games
- `/frontend/public/trading.html` — Leverage trading with TradingView charts
- `/frontend/public/dashboard.html` — Bot control panel
- `/frontend/public/deploy-farms.html` — Farm deployer
- `/frontend/public/deploy.html` — Contract deployer
- `/backend/server.py` — Main FastAPI server
- `/backend/telegram_bot.py` — Telegram bot (refactored, dispatch table)
- `/backend/mining_api.py` — Casino/mining backend
- `/backend/trading_api.py` — Leverage trading backend

## Owner Wallet
`0xaA3C5749628610fF410EF9133a4ac4f58e9A52eA`

## Key Contracts
- GANG Token: `0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF`
- Mining Rewards: `0xBdAaDDb1cd25758aa40F38c273C355cA943e1c8F`
- MasterChef: `0x3713567b8DB60D7127B2614965eef71cE50871Ea` (301M+ GANG)
- Liquidity Lock: `0xfa7f753a1e4ef3f1f3c8438f53855dfb58fde389` (DX.app, expires Mar 2027)

## Farm Allocations (On-Chain — Confirmed)
- CRO/GANG (Pool 0): 250,000 pts = 50%
- All other 12 pools: 20,833 pts each = 4.17% each
- 7 farms + 6 auto-compound vaults = 13 pools total

## Completed Features (All Sessions)
- Image optimization, lazy loading
- Telegram bot — full feature popups, BuyBot alerts, auto-post on start, LP Lock proof
- Mining Hub — 19 games, tap-to-earn, VIP, referrals, lottery, staking, tournaments
- Leverage Trading — 8 pairs, 100x, live TradingView charts
- 3 new farms (XRP/GANG, PEPE/GANG, DOGE/GANG)
- Dashboard — bot start/stop, quickstart guide, full command list
- Deploy Farms + Deploy Contract pages
- Nav bar — wrapped rows, all items visible, header gangster banner
- Farms — single column, sorted by highest APR, rebalance button (owner-only)
- Vault APR calculations from MasterChef on-chain data
- Code quality refactor — telegram_bot.py dispatch table, secrets module, dead code removed
- MasterChef rebalance — 13 pools set to 50%/4.17% split
- Cleanup — removed old debug elements, duplicate HTML files (57MB freed), old zip packages
- Download package: cronos-gangsters-full-app.zip (12MB)

## Backlog
- P2: Add max payout limits for trading
- P3: Fix use-toast.js stale closures (React, low priority)
