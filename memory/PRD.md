# Cronos Gangsters — Product Requirements Document

## Original Problem Statement
Build a Telegram Bot for the Cronos Gangsters Web3 DEX with ALL website features accessible via interactive buttons. Clone the user's live website into a downloadable HTML file.

## Core Components
1. **Telegram Bot** (`/app/backend/telegram_bot.py`) — All features as interactive buttons
2. **React Dashboard** (`/app/frontend/src/App.js`) — Bot management UI
3. **FastAPI Backend** (`/app/backend/server.py`) — API for bot control + price fetching
4. **Website Clone** (`cronos-gangsters-full.html`) — Full 28MB cloned website

## What's Been Implemented

### Phase 1: Telegram Bot — 28 Commands (COMPLETE)
### Phase 2: React Dashboard (COMPLETE)
### Phase 3: Website Clone + ZIP Package (COMPLETE)
### Phase 4: Full Feature Menu Buttons (COMPLETE - April 2026)
Updated the Telegram bot so ALL features show as clickable buttons:
- Main keyboard now has 12 feature buttons (Farms, Vaults, Staking, Launchpad, Token Locker, Sniper Bot, NFTs, Referral, Bridge, Lottery, Token Creator, Marketplace)
- Each button opens the feature info inline with a "Back to Menu" button
- /start message lists all features
- All callback handlers added for menu_farms, menu_vaults, menu_staking, menu_launchpad, menu_locker, menu_sniper, menu_nft, menu_referral, menu_bridge, menu_lottery, menu_create, menu_marketplace, menu_back

### Website Speed Optimization (REVERTED)
- User's uploaded file was an older version missing features (launchpad, token locker, etc.)
- Optimization was applied to wrong file; user declined
- Original full website clone remains untouched at `/cronos-gangsters-full.html`

## Download Links
- Full website: `/cronos-gangsters-full.html` via preview URL

## Tech Stack
- Frontend: React.js (Dashboard)
- Backend: FastAPI, Python Telegram Bot (v20+)
- Blockchain: Ethers.js v6, Cronos chain
- APIs: CoinGecko, DexScreener, Telegram Bot API
