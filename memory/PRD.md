# Cronos Gangsters DApp — PRD

## Original Problem Statement
Build a complete Web3 DApp for the $GANG token on Cronos chain with DEX features (swap, liquidity, farms, vaults, staking), a Telegram community bot, mining hub, leverage trading, NFT marketplace, lottery, and token creator.

## Architecture
- Frontend: Vanilla HTML/JS (`cronos-gangsters.html` ~14k+ lines), Ethers.js v6
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

### Session 5 — April 3, 2026 (Latest)

**Nav Redesign:**
- Removed bubble/pill button styling
- Implemented collapsible hamburger menu (3 gold lines icon)
- Clean gold underline text style for nav items
- Header is now thin: logo + hamburger + connect wallet
- Menu slides down on tap, auto-closes when page selected
- Full screen content visible when scrolling

## Deployment
- User hosts on GoDaddy (domain only, NO hosting plan)
- App is packaged as a zip for manual download and upload
- User needs free hosting solution (Netlify recommended)

## Backlog
- P0: Help user deploy updated file to their live site
- P1: User to activate 0.05% protocol fee via Revenue page button after deployment
- P2: Verify smart contracts on CronoScan
- P2: Verify BuyBot DexScreener polling (buy alert system)
