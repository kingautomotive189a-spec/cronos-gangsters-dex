# Cronos Gangsters DApp — PRD

## Original Problem Statement
Build a complete Web3 DApp for the $GANG token on Cronos chain with DEX features, Telegram bot, mining hub, leverage trading, NFT marketplace, lottery, and token creator.

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~16.5k lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Deployment: User downloads ZIP, uploads HTML to GoDaddy manually

## What's Been Implemented

### Session 8 — April 4, 2026

**Mobile-Friendly & Visual Overhaul:**
- Lightened entire theme from pure black (#111) to deep navy (#151820)
- Updated all surface/card colors to navy palette (--surface #1c2030, --surface2 #232840, etc.)
- Gold accent brightened (#d4a017 → #e8b830) for better contrast
- Green accent updated (#27ae60 → #30c070) for visibility
- Added subtle radial gradient glow to body background
- Chart backgrounds updated from #0a0a0a to #101420
- Header backdrop-filter blur increased to 16px
- Cards now have hover shadow + fadeInUp animation
- Farm cards have translateY(-2px) hover lift
- Buttons have active press-down transform

**Mobile Responsive:**
- Added 3-tier responsive rules: @700px, @480px, @360px
- Stats bar: 2-column on mobile, single column on tiny screens
- Farm grids: single column on mobile
- Card padding/border-radius adjusted for touch
- Button sizes increased for mobile touch targets (min 44px)
- Swap input font sizes adjusted for readability
- iframes: max-width:100% + border-radius on mobile
- DexScreener chart: 420px→320px→280px height on smaller screens
- Futures chart: 300px→260px→220px height on mobile
- Futures pair buttons: smaller padding/logos on mobile
- Header wraps with Connect Wallet repositioned on narrow screens
- Price ticker horizontal scroll with -webkit-overflow-scrolling:touch
- Pool info bar flex-wrap for mobile

**0.3% Fee Final Fix (6 instances):**
- Protocol fee display, config, button text, messages all changed from 0.05% → 0.3%

**Telegram Bot Phase 8 Update:**
- 3 new commands: /futures, /tracker, /roadmap
- New menu buttons: GANG FUTURES, GANG TRACKER, Roadmap
- Enhanced /farms with live APRs, fire icons for high-APR farms
- Enhanced /vaults with auto-compound APYs and explanation
- Updated /start, /help, /shill, startup msg, periodic price update
- All fee references standardized to 0.3%
- 32 total commands registered

### Previous Sessions
- GANG FUTURES (33 pairs, dual currency, Yahoo Finance proxy)
- DexScreener live chart with multi-coin selector
- Hamburger menu redesign with icons
- GANG TRACKER multi-chain wallet scanner
- All platform fees to 0.3%
- Roadmap Phase 8 in HTML

## Backlog
- P0: Monitor GANG TRACKER RPC rate limits when live
- P1: Verify BuyBot DexScreener polling
- P2: Verify smart contracts on CronoScan
