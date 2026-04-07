# Cronos Gangsters DApp — Product Requirements

## Problem Statement
Web3 DeFi DApp on Cronos blockchain. Single-file HTML deployment (~28K lines) for GoDaddy hosting. Real on-chain smart contract interactions via Trading Vault, VVS Finance LP pools, and custom contracts.

## Architecture
- **Single file**: `/app/frontend/public/cronos-gangsters.html`
- **Delivery**: `/app/frontend/public/cronos-gangsters-deploy.zip`
- **Stack**: Vanilla HTML/JS, Ethers.js v6, no framework
- **Data**: 100% on-chain (no database)
- **APIs**: Binance WebSocket, CoinGecko, DexScreener (all free/no key)

## Completed Features
- Trading 212 style Leverage Trading UI (100x, 69 pairs)
- Arsenal (32 features) in collapsible `<details>` bar
- Owner Pool Controls (8 features) in collapsible `<details>` bar
- Global header isolation (stats bar, contract address, war room images only on homepage)
- Mobile CSS contrast fixes for leverage trading page (inline rgba values boosted)
- 70+ asset pills on homepage leverage showcase
- Aggressive cache-busting meta tags
- On-chain LP liquidity reader — reads ALL 12 VVS LP pools with dynamic token detection. Total ~$1.6K shown on homepage.
- DexScreener chart pointed to CRO/GANG LP pair (most liquid)
- **FIXED**: `futuresBottomNav` full-screen overlay bug (added `top:auto`)
- **FIXED**: Horizontal scroll/swipe bug on mobile (added `overflow-x:hidden` + `touch-action:pan-y` to page, main, html, body)

## Key Technical Notes
- **NEVER break into multiple files** — single HTML only
- **Small search_replace chunks** — max 50-100 lines per edit
- **Do NOT touch wallet logic** — verified working
- **Always generate ZIP** after changes
- **`futuresBottomNav` MUST have `top:auto`**
- **All `.page` divs need `overflow-x:hidden; max-width:100vw`**

## Upcoming Tasks (P1)
- Revamp rest of UI to match Trading 212 / Fulcrom Finance modern styling
- CEX listings feature
- Multi-chain expansion

## Backlog (P2)
- Mobile App
