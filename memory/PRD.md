# Cronos Gangsters DApp — PRD

## Original Problem Statement
Build a complete Web3 DApp for the $GANG token on Cronos chain with DEX features, Telegram bot, mining hub, leverage trading, NFT marketplace, lottery, and token creator.

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~16k+ lines), Ethers.js v6
- Backend: FastAPI (`server.py`, `trading_api.py`, `mining_api.py`)
- Telegram Bot: python-telegram-bot v20+ (`telegram_bot.py`)
- Deployment: User downloads ZIP, uploads HTML to GoDaddy manually

## What's Been Implemented

### Session 7 — April 4, 2026

**ALL fees set to 0.3% — FINAL:**
- Fixed 6 remaining instances of 0.05% in cronos-gangsters.html
- Protocol fee display: 0.05% → 0.3%
- Treasury protocolFee config: 0.05 → 0.30
- Activation button text: 0.05% → 0.3%
- Success/error messages: 0.05% → 0.3%
- Comments updated to reflect 0.3%
- ZERO instances of 0.05% remain anywhere in codebase

**Telegram Bot Phase 8 Update:**
- Added 3 new commands: `/futures`, `/tracker`, `/roadmap`
- Added GANG FUTURES, GANG TRACKER, Roadmap menu buttons + callbacks
- Updated `/start`, `/help`, `/shill`, startup msg, periodic price update
- Standardized all fee refs to 0.3% in bot
- 32 total commands registered

### Session 6 — April 4, 2026
- GANG FUTURES Yahoo Finance proxy, logos, UI overhaul
- Hamburger nav redesign with icons
- DexScreener live chart multi-coin selector
- Fee standardization to 0.3% (Swap, Futures, LP)
- Dual currency futures (GANG + CRO)
- Roadmap Phase 8 in frontend HTML

## Backlog
- P0: Monitor GANG TRACKER RPC rate limits when live
- P1: Verify BuyBot DexScreener polling
- P2: Verify smart contracts on CronoScan
