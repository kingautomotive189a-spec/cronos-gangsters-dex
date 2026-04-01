# Cronos Gangsters — PRD

## Original Problem Statement
Ultra-fast vanilla JS DApp for Cronos Gangsters DEX with Telegram bot, mining/casino games, leverage trading, deploy farms, dashboard, and owner revenue collection.

## Architecture
- Frontend: Vanilla JS/HTML standalone pages in /frontend/public/
- Backend: FastAPI + python-telegram-bot (v20+)
- Database: MongoDB (Motor async driver)
- Blockchain: Cronos mainnet via ethers.js v5

## Key Files
- `/frontend/public/cronos-gangsters.html` — Main DApp (Swap, Farms, Vaults, etc.)
- `/frontend/public/mining.html` — Mining Hub + 19 casino games
- `/frontend/public/trading.html` — Leverage trading with TradingView charts
- `/frontend/public/dashboard.html` — Bot control panel
- `/frontend/public/deploy-farms.html` — Farm deployer (completed)
- `/frontend/public/deploy.html` — Contract deployer (completed)
- `/backend/server.py` — Main FastAPI server
- `/backend/telegram_bot.py` — Telegram bot (refactored)
- `/backend/mining_api.py` — Casino/mining backend
- `/backend/trading_api.py` — Leverage trading backend

## Owner Wallet
`0xaA3C5749628610fF410EF9133a4ac4f58e9A52eA`

## Key Contracts
- GANG Token: `0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF`
- Mining Rewards: `0xBdAaDDb1cd25758aa40F38c273C355cA943e1c8F` (funded with 25,000 GANG)
- MasterChef: `0x3713567b8DB60D7127B2614965eef71cE50871Ea` (holds 301M+ GANG)

## Token Addresses (Cronos Mainnet)
- XRP: `0xb9Ce0dd29C91E02d4620F57a66700Fc5e41d6D15`
- PEPE: `0xf868c454784048AF4f857991583E34243c92Ff48`
- DOGE: `0x1a8E39ae59e5556B56b76fCBA98d22c9ae557396`

## Completed Features
- Image optimization (22MB→5MB), lazy loading
- Telegram bot with callback popups for all features
- Mining Hub (19 games, tap-to-earn, VIP, referrals, lottery, staking, tournaments)
- Leverage Trading (8 pairs, 100x, live TradingView charts)
- 3 new farms (XRP/GANG, PEPE/GANG, DOGE/GANG)
- Dashboard with bot start/stop
- Deploy Farms + Deploy Contract (completed, banners removed from nav)
- Owner revenue collection banners
- Fund Mining Rewards banner on mining page
- "How to Earn Real $GANG" user guide on mining page
- Roadmap updated: Phase 7 (DONE), Phase 8 (COMING SOON)
- Nav scroll indicator (pulsing >> arrows)
- Fixed: PEPE address, XRP address, owner wallet, bot Python path
- All token logos from CoinGecko (original/real)
- Code Quality Refactor: telegram_bot.py callback_handler reduced from 440 lines/36 branches to 16 lines/2 branches via dispatch table
- Security: Replaced `random` with `secrets` for captcha generation
- Cleanup: Removed dead anti_scam_filter, SCAM_PATTERNS, SUSPICIOUS_DOMAINS code
- Bug Fix: FARMS data 'apr' key crash in /farms command
- Bug Fix: trading_api.py duplicate _id parameter causing TypeError
- Bug Fix: server.py ObjectId serialization in record-price endpoint
- MasterChef balance verified on-chain: 301,224,949.75 GANG

## Backlog
- P1: Verify owner revenue Web3 transactions end-to-end
- P1: Remind user to click "FIX PEPE/GANG FARM" button on live site after deploying
- P2: Add max payout limits for trading
- P2: Fix use-toast.js stale closures (React frontend, low priority)
