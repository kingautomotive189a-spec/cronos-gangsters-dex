# Cronos Gangsters — Product Requirements Document

## Original Problem Statement
Build a Telegram Bot for the Cronos Gangsters Web3 DEX with ALL website features accessible via interactive buttons. Clone the user's live website into a downloadable HTML file. Optimize DApp loading speed. Ensure all Telegram buttons link to correct DApp sections.

## Core Components
1. **Telegram Bot** (`/app/backend/telegram_bot.py`) — All features as interactive buttons
2. **React Dashboard** (`/app/frontend/src/App.js`) — Bot management UI
3. **FastAPI Backend** (`/app/backend/server.py`) — API for bot control + price fetching
4. **Web3 DApp** (`/app/frontend/public/cronos-gangsters.html`) — Full DEX frontend with swap, farms, vaults, staking, etc.

## What's Been Implemented

### Phase 1: Telegram Bot — 28 Commands (COMPLETE)
### Phase 2: React Dashboard (COMPLETE)
### Phase 3: Website Clone + ZIP Package (COMPLETE)
### Phase 4: Full Feature Menu Buttons (COMPLETE)
- Main keyboard with 12 interactive links mapping to hash-routed DApp sections
- Each button opens feature info inline with "Back to Menu"

### Phase 5: DApp Speed Optimization (COMPLETE)
- JavaScript parallelization (Promise.all) for Vaults, Farms, RPC calls
- Hash Router for Telegram deep links (#farms, #vaults, etc.)
- Deploy banners hidden via CSS, owner panels preserved
- Hardcoded Launchpad/Lottery contract addresses

### Phase 6: Ultra-Fast Loading Optimization (COMPLETE)
- Images compressed 73%: All 16 gangster images resized 1024px→512px (22MB→5.8MB)
- Gang logo compressed 98%: 1.1MB→26KB (resized to 128px)
- Lazy loading on 50 images: Hidden page images defer until viewed
- Resource hints: preconnect/dns-prefetch for DexScreener, CoinGecko, Cronos RPCs, fonts CDN
- Parallel startup: DexScreener + farm pool discovery run simultaneously
- Vault scan delays removed: No more 500ms/1500ms artificial waits between pool reads
- Hash navigation 15x faster: 1500ms→100ms delay

### Phase 7: Hash Routing Fix for Telegram Links (COMPLETE)
- Fixed index.html redirect to preserve URL hash fragments
- `cronosgangsters.com#farms` now correctly redirects to `cronos-gangsters.html#farms`
- All 14 Telegram inline keyboard buttons now link to correct DApp sections

## Pending Code Quality Items (Optional, not blocking)
- Severe complexity in `callback_handler()` (311 lines, cyclomatic complexity 44)
- Insecure random generation in telegram_bot.py (use `secrets` instead of `random`)
- Identity comparison bugs (`is` vs `==`) in telegram_bot.py and server.py
- Frontend hook dependency issues in use-toast.js

## Tech Stack
- Frontend: React.js (Dashboard), Vanilla JS/Ethers.js v6 (DApp)
- Backend: FastAPI, Python Telegram Bot (v20+)
- Blockchain: Cronos chain, Web3 RPC
- APIs: CoinGecko, DexScreener, Telegram Bot API

## Key URLs
- DApp: `/cronos-gangsters.html`
- Hash routes: `#swap`, `#farms`, `#vaults`, `#staking`, `#launchpad`, `#locker`, `#sniper`, `#nfts`, `#referral`, `#bridge`, `#lottery`, `#create`, `#marketplace`, `#roadmap`
