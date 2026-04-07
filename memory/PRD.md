# Cronos Gangsters DApp — Product Requirements

## Original Problem Statement
A massive 27,000+ line Web3 DApp deployed as a single HTML file (`cronos-gangsters.html`) on GoDaddy. The app is a fully on-chain DeFi platform on Cronos chain with 28+ features including leverage trading, swaps, staking, farms, vaults, flash loans, prediction markets, NFTs, and more.

## Architecture
- **Single file**: Everything lives in `/app/frontend/public/cronos-gangsters.html` (~27,760 lines)
- **Stack**: Vanilla HTML/CSS/JS, Ethers.js v6, TradingView charts, Binance WebSocket
- **Chain**: Cronos Mainnet
- **Vault**: `0x68B1837b9360C661f954147f178DE7781026a16d` (Trading Vault smart contract)
- **GANG Token**: `0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF`
- **Delivery**: ZIP file (`cronos-gangsters-deploy.zip`) for manual GoDaddy upload

## What's Been Implemented

### Session 1-N (Previous)
- Full DApp with 28+ DeFi features
- MetaMask wallet integration
- TradingView charts for 69 tradeable assets
- Binance WebSocket for live crypto prices

### Current Session — Completed
- [x] Deployed real Trading Vault smart contract on Cronos
- [x] Rewrote `openFuturesPosition()` for real on-chain CRO/GANG transfers via MetaMask
- [x] Rewrote `closeFuturesPosition()` for real on-chain vault withdrawals
- [x] Rewrote `futuresOwnerDeposit()` / `futuresOwnerWithdraw()` for real vault operations
- [x] Removed all fake mock fallback functions
- [x] Auto-wipe script for clearing old fake localStorage data
- [x] Cache-busting version numbers for wallet browser caching
- [x] Real on-chain pool balance reads
- [x] **Trading 212 UI Revamp** — Compact header, clean stats strip, horizontal account overview, cleaner asset browser, bottom nav bar, collapsible FAQ
- [x] Replaced all debug `alert()` calls with clean `showToast()` notifications
- [x] **Collapsible "THE FULL ARSENAL"** — 32 feature grid wrapped in expandable `<details>` button
- [x] **Collapsible Owner Pool Controls** — 8 pool deposit/withdraw boxes wrapped in expandable `<details>` with total vault liquidity summary
- [x] Total vault liquidity display showing real on-chain GANG + CRO balances
- [x] **Global Header Elements** — Stats bar, war images, contract banner, promo ticker now ONLY show on the main page, hidden on all other pages
- [x] ZIP file regenerated for deployment

## Key Constraints
- MUST remain a single HTML file (no React, no components)
- All wallet transactions MUST be real on-chain (no mocks)
- ZIP delivery after every change
- Vault address hardcoded: `0x68B1837b9360C661f954147f178DE7781026a16d`

## Backlog

### P1 — Upcoming
- Revamp rest of app UI to match Trading 212 styling (other pages)
- CEX listings
- Multi-chain expansion

### P2 — Future
- Mobile App
