# Cronos Gangsters DApp — PRD

## Original Problem Statement
Build a complete Web3 DApp for the $GANG token on Cronos chain with DEX features (swap, liquidity, farms, vaults, staking), a Telegram community bot, mining hub, leverage trading, NFT marketplace, lottery, and token creator.

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~13,800 lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Smart Contracts: MasterChef, Staking, Lottery (Solidity)
- No React — the React scaffold exists but is unused

## Completed Features
- Swap, Liquidity, Farms (7 active + 3 coming soon), Vaults (6 auto-compound), Staking, Bridge, Portfolio
- Lottery feature (contract at 0xd2c46260...f27, 70/20/10 split)
- NFT mint/gallery, Marketplace, Token Creator, Launchpad, Sniper Bot, Referral system
- Mining Hub (19 casino games + daily tap mining)
- Leverage Trading (8 pairs, up to 100x, max payout 50x cap)
- Telegram Bot with live APR/TVL from DexScreener, lottery info, captcha verification, buy alerts

## Session 4 — April 3, 2026
- Completed Lottery feature: removed duplicate page-lottery HTML, fixed broken JS references
- Deep dive audit: fixed server.py logger ordering, Cloudflare cruft removal, stale APR/TVL data
- Telegram bot: live farm APR/TVL via fetch_live_farm_data(), correct lottery split (70/20/10), LOTTERY contract in CONTRACTS dict
- Fixed Coming Soon farm CRO/USDC using wrong LP address
- Fixed security features text (3 warnings = ban, not 2)
- All tests passed: 24/24 backend, 13/13 frontend

## Backlog
- P2: Verify BuyBot DexScreener polling
