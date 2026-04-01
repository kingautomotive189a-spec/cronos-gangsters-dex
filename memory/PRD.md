# Cronos Gangsters — Product Requirements Document

## Original Problem Statement
Build a comprehensive Telegram Bot for the Cronos Gangsters Web3 DEX, matching all website features (swap, bridge, vaults, farms, etc.), with admin controls and security measures. Clone the user's live website into a downloadable HTML file, and optimize the website's JavaScript for ultra-fast page loading across ALL sections.

## Core Components
1. **Telegram Bot** (`/app/backend/telegram_bot.py`) — 28 commands mirroring website features
2. **React Dashboard** (`/app/frontend/src/App.js`) — Bot management UI
3. **FastAPI Backend** (`/app/backend/server.py`) — API for bot control + price fetching
4. **Optimized Website** (`cronos-gangsters-turbo.html`) — Speed-optimized from correct source (`cronos-gangsters (27).html`, 349.7KB, 6735 lines)

## Tech Stack
- Frontend: React.js (Dashboard), Vanilla HTML/JS/CSS (Web3 Website)
- Backend: FastAPI, Python Telegram Bot (v20+)
- Blockchain: Ethers.js v6, Cronos chain (Chain ID 25)
- APIs: CoinGecko, DexScreener, Telegram Bot API

## What's Been Implemented

### Phase 1: Telegram Bot (COMPLETE)
### Phase 2: React Dashboard (COMPLETE)
### Phase 3: Website Clone (COMPLETE)

### Phase 4: Full-Site Speed Optimization (COMPLETE - April 2026)
Optimized the CORRECT file (`cronos-gangsters (27).html`) — 6735 lines with vaults, staking, NFTs, referrals.

**Functions optimized:**
1. `loadBalances()` — Token balances + LP balances all parallel via Promise.allSettled
2. `fetchFarmTVLs()` — All 14+ farms queried simultaneously
3. `calcFarmAPRs()` — All pool info calls batched in parallel
4. `fetchLivePrices()` — CoinGecko + DexScreener + FarmTVLs all parallel
5. `fetchGangPriceOnChain()` — Pair address cached after first lookup
6. `fetchPoolRatio()` — Uses global LP address cache
7. `loadOnChainStakes()` — All stakes fetched in parallel
8. `loadNftPreviewGallery()` — All 8 metadata fetches in parallel
9. `loadUserNfts()` — All user NFT metadata in parallel
10. `autoDiscoverFarmPools()` — Uses LP address cache
11. Init startup — DexScreener + autoDiscover run in parallel

**Infrastructure additions:**
- Global LP Address Cache (`_lpAddrCache`) — eliminates duplicate factory.getPair RPCs
- GANG pair address cache (`_gangPairAddr`)
- Refresh interval: 5s → 10s (50% less RPC load)
- Liq ratio only computed when page visible

## Download
- Optimized file: `/cronos-gangsters-turbo.html` (via preview URL)

## Constraints
- NO smart contract logic, addresses, or ABIs altered
- CSS and layout remain identical
- All optimizations purely in JavaScript data fetching
