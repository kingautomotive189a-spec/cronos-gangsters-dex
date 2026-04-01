# Cronos Gangsters — Product Requirements Document

## Original Problem Statement
Build a comprehensive Telegram Bot for the Cronos Gangsters Web3 DEX, matching all website features (swap, bridge, vaults, farms, etc.), with admin controls and security measures. Additionally, clone the user's live website into a downloadable HTML file, and optimize the website's JavaScript for faster page loading.

## Core Components
1. **Telegram Bot** (`/app/backend/telegram_bot.py`) — 28 commands mirroring website features
2. **React Dashboard** (`/app/frontend/src/App.js`) — Bot management UI
3. **FastAPI Backend** (`/app/backend/server.py`) — API for bot control + price fetching
4. **Web3 Website** (`cronos-gangsters-full.html`) — Cloned 28MB single-file website
5. **Optimized Website** (`cronos-gangsters-turbo.html`) — Speed-optimized version

## Tech Stack
- Frontend: React.js (Dashboard), Vanilla HTML/JS/CSS (Web3 Website)
- Backend: FastAPI, Python Telegram Bot (v20+)
- Blockchain: Ethers.js v6, Cronos chain (Chain ID 25)
- APIs: CoinGecko, DexScreener, Telegram Bot API

## What's Been Implemented

### Phase 1: Telegram Bot (COMPLETE)
- 28 commands mapped to all website features
- Security: Math Captcha, Anti-scam link filter, Auto-ban
- Admin controls

### Phase 2: React Dashboard (COMPLETE)
- Bot start/stop/status management
- GANG logo branding

### Phase 3: Website Clone (COMPLETE)
- Full 28MB site cloned to single HTML file
- Deploy banners hidden
- ZIP package created for download

### Phase 4: JavaScript Speed Optimization (COMPLETE - April 2026)
Optimizations applied to `cronos-gangsters-turbo.html`:

1. **`loadBalances()` — Fully parallelized**
   - Before: 13 token balances + 14 farm rewards + 14 LP balances fetched SEQUENTIALLY
   - After: All token balances in one `Promise.allSettled()`, all farm data in parallel

2. **`fetchFarmTVLs()` — Fully parallelized**
   - Before: 14 farms queried one-by-one, each with 2-3 RPC calls
   - After: All LP address resolution in parallel, then all TVL lookups via `Promise.allSettled()`

3. **`fetchGangPriceOnChain()` — Pair address cached**
   - Before: `factory.getPair()` called every refresh cycle
   - After: Pair address cached after first lookup, skipping redundant RPC

4. **`fetchLivePrices()` — All sub-tasks parallelized**
   - Before: CoinGecko → GANG price → Farm TVLs → DexScreener (sequential)
   - After: All 4 tasks run via `Promise.allSettled()` simultaneously

5. **`fetchPoolRatio()` — Uses LP address cache**
   - Before: `factory.getPair()` called every time
   - After: Uses `getCachedPairAddr()` to skip redundant lookups

6. **Farm reward polling — Parallelized**
   - Before: 14 sequential `pendingGang()` calls every 15s
   - After: All 14 calls in single `Promise.allSettled()`

7. **Global LP Address Cache (`_lpAddrCache`)**
   - Stores `factory.getPair()` results by sorted address pair
   - Eliminates duplicate RPC calls across all functions

8. **Refresh intervals optimized**
   - Price ticker: 5s → 10s (still responsive, 50% less RPC load)
   - CoinGecko: 5s → 30s (respects free tier rate limits)
   - Liquidity ratio: Only fetched when liquidity page is visible

## Download Links
- Optimized file: `/cronos-gangsters-turbo.html` (via preview URL)
- Original clone: `cronos-gangsters-full.html`

## Constraints
- NO smart contract logic, addresses, or ABIs were altered
- CSS and layout remain identical
- All optimizations are purely in data fetching JavaScript
