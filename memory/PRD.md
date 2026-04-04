# Cronos Gangsters DApp — PRD

## Original Problem Statement
Build a complete Web3 DApp for the $GANG token on Cronos chain with DEX features (swap, liquidity, farms, vaults, staking), a Telegram community bot, mining hub, leverage trading, NFT marketplace, lottery, and token creator.

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~16k+ lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Smart Contracts: MasterChef, Staking, Lottery (Solidity)

## What's Been Implemented

### Session 4 — April 3, 2026

**Lottery Feature:**
- Removed duplicate page-lottery HTML, fixed broken JS references to deployLotteryBanner
- Lottery contract at 0xd2c46260...f27 with ABI fully injected

**Max Payout:**
- Added MAX_PAYOUT_MULT = 50 cap for paper trading positions

**Deep Dive Audit + Performance Optimization:**
- Fixed 33 broken/null element references in JS
- Removed optional chaining assignment bugs, balanced all code braces
- Batched RPC calls for Farm APRs and Vault TVLs
- Cached DexScreener for 15s, lazy-loaded 119 images
- Reduced wallet connection chain-switch delay

**Telegram Bot:**
- Live APR/TVL via fetch_live_farm_data() from DexScreener
- Correct lottery info (70% winner, 20% burned, 10% treasury)
- Added /contracts and /faq commands

**Fee Collections Verified:**
- All fees (Swap, NFT, Marketplace, Lottery, Launchpad, Locker) route to owner wallet 0xaA3C5749628610fF410EF9133a4ac4f58e9A52eA

**New Pages Added:**
- Contracts page, FAQ page, public emission rate display, scrolling feature banner

**Swap Protocol Fee Button:**
- BIG green glowing "TAP HERE TO ACTIVATE 0.05% FEE" button on Revenue page
- Calls factory.setFeeTo() on-chain to enable 0.05% protocol fee

### Session 5 — April 3, 2026

**Nav Redesign:**
- Collapsible hamburger menu (3 gold lines icon)
- Clean gold underline text style for nav items
- Thin header: logo + hamburger + connect wallet

**0.3% Platform Fee:**
- 0.3% fee subtracted before swap execution, routed to owner treasury

**Telegram Bot Fix:**
- Fixed jamming by handling SIGTERM in server.py subprocess management

**Limit Orders:**
- Limit order panel on swap page with periodic price monitoring

**Leaderboard + Points System:**
- Points for swaps, trades, daily login
- Top 20 leaderboard display

**Token Burn Tracker:**
- Tracks dead address + zero address balances
- Shows burn %, circulating supply

**Portfolio P&L Tracker:**
- Tracks entry prices in localStorage
- Shows per-token and total P&L

**GANG TRACKER:**
- Multi-chain wallet scanner (Cronos + ETH, BSC, Polygon, Arbitrum, Avalanche, Base)
- Scans tokens, farm positions, staking, LP, NFTs

**GANG FUTURES:**
- Leverage trading platform with crypto, stocks, indices, commodities
- Up to 50x leverage with GANG token
- Opening/closing fees routed to pool

### Session 6 — April 4, 2026

**GANG FUTURES Bug Fixes (CRITICAL):**
- Fixed TradingView chart: was hardcoding `BINANCE:` prefix for all pairs — now uses correct `p.tv` symbol (e.g., `NASDAQ:AAPL`, `TVC:GOLD`, `PEPPERSTONE:NAS100`)
- Fixed price feed: stocks/indices/commodities had no price source (only Binance API). Added Yahoo Finance backend proxy (`/api/futures/prices`) with 30s cache
- Added Yahoo Finance ticker mapping for all 33 tradeable pairs (crypto + stocks + indices + commodities)
- Backend proxy serves as primary price source for ALL assets (avoids CORS issues)
- Binance/CoinGecko kept as client-side fallbacks for crypto
- CORS proxy fallbacks (corsproxy.io, allorigins.win) for standalone HTML deployments
- Fixed empty emoji on close position toast message

## Deployment
- User hosts on GoDaddy (uploads HTML file manually)
- Backend runs on Emergent platform
- Download links: `cronos-gangsters-latest.zip` (HTML only), `cronos-gangsters-full-package.zip` (full)

## Backlog
- P0: User to deploy updated file to GoDaddy and verify
- P1: User to activate 0.05% protocol fee via Revenue page button
- P2: Verify smart contracts on CronoScan
- P2: Monitor public RPC rate limits on GANG TRACKER under heavy usage
