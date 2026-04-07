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
- On-chain LP liquidity reader (12 VVS pools, ~$1.6K total)
- DexScreener chart → CRO/GANG LP pair
- `futuresBottomNav` overlay fix (`top:auto`)
- Horizontal scroll lock
- Homepage layout: Leverage showcase (live prices) → gangster cards → earn → swap
- Live price grid on homepage (12 assets, Binance WS, 2s refresh)
- Trading 212 style asset cards (pure black, emojis, bigger logos, change arrows)
- Clear History fix (only clears closed trades, never touches open positions or pool)
- **Chart position entry lines**: Green dashed line for LONG, red for SHORT at entry price. PnL badge updates in real-time. Liquidation price shown as thin red dotted line. Lines appear on open, disappear on close.

## Key Technical Notes
- NEVER break into multiple files
- Small search_replace chunks
- Do NOT touch wallet logic
- Always generate ZIP after changes
- `futuresBottomNav` MUST have `top:auto`
- `renderChartPositionLines()` called from: Binance WS handler, simulation tick, open position, close position, chart load

## Upcoming Tasks (P1)
- Continue UI polish across other pages
- CEX listings feature
- Multi-chain expansion

## Backlog (P2)
- Mobile App
