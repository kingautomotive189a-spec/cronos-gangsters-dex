# Cronos Gangsters DApp — Product Requirements

## Problem Statement
Web3 DeFi DApp on Cronos blockchain. Single-file HTML deployment (~28K lines) for GoDaddy hosting.

## Architecture
- **Single file**: `/app/frontend/public/cronos-gangsters.html`
- **Delivery**: `/app/frontend/public/cronos-gangsters-deploy.zip`
- **Stack**: Vanilla HTML/JS, Ethers.js v6, no framework
- **Data**: 100% on-chain (no database)

## Completed Features
- Trading 212 style Leverage Trading UI (100x, 69 pairs)
- Arsenal + Owner Pool Controls in collapsible bars
- Global header isolation (homepage only)
- Mobile CSS contrast fixes (Crypto.com wallet browser)
- Cache-busting meta tags
- On-chain LP liquidity reader (12 VVS pools, total ~$1.6K)
- DexScreener chart → CRO/GANG LP pair
- `futuresBottomNav` overlay fix (`top:auto`)
- Horizontal scroll lock (`overflow-x:hidden` + `touch-action:pan-y`)
- Homepage layout: Leverage showcase (live prices) → gangster cards → earn → swap
- Live price grid on homepage (12 assets, Binance WS, 3s refresh)
- Leverage isolation: homepage + leverage page ONLY
- **Trading 212 style asset cards**: Pure black backgrounds (#000/#0e0e0e), bigger logos (36px), emoji icons for commodities/indices (🥇 Gold, 🛢️ Oil, 🌾 Wheat, 🇺🇸 S&P, etc.), green status dots, change arrows (↗↘), bolder text, 2-column grid

## Key Technical Notes
- NEVER break into multiple files
- Small search_replace chunks
- Do NOT touch wallet logic
- Always generate ZIP after changes
- `futuresBottomNav` MUST have `top:auto`
- All `.page` divs need `overflow-x:hidden; max-width:100vw`
- Commodities/indices use `emoji: true` flag for large emoji display

## Upcoming Tasks (P1)
- Continue UI polish across other pages
- CEX listings feature
- Multi-chain expansion

## Backlog (P2)
- Mobile App
