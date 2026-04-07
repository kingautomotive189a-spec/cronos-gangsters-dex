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
- **Homepage layout reorder**: Leverage showcase with LIVE prices (12 assets from Binance WS) → gangster cards → earn highlights → swap box
- **Live price grid on homepage**: Bitcoin $68K, ETH $2K, NVDA $176, AAPL $252, Gold $4.7K, Nasdaq $24K, EUR/USD etc. — updates every 3 seconds via Binance WebSocket
- **Leverage trading isolation**: Only shows on homepage (showcase) + leverage page — confirmed NOT on farms/liquidity/other pages

## Key Technical Notes
- NEVER break into multiple files
- Small search_replace chunks (50-100 lines max)
- Do NOT touch wallet logic
- Always generate ZIP after changes
- `futuresBottomNav` MUST have `top:auto`
- All `.page` divs need `overflow-x:hidden; max-width:100vw`
- Homepage prices come from `futuresState.prices[]` (Binance WS) + `TOKENS[].price` (CoinGecko)

## Upcoming Tasks (P1)
- Revamp rest of UI to match Trading 212 / Fulcrom Finance styling
- CEX listings feature
- Multi-chain expansion

## Backlog (P2)
- Mobile App
