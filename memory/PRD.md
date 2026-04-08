# Cronos Gangsters DApp — PRD

## Overview
Single-file Web3 DApp for the Cronos blockchain. All UI, CSS, JS, ABIs, and smart contract interaction logic lives in one HTML file (`cronos-gangsters.html`).

## Architecture
- **Frontend**: `/app/frontend/public/cronos-gangsters.html` (~28,700 lines)
- **Chart Library**: TradingView Lightweight Charts v4.2 (CDN + local backup `lightweight-charts.js`)
- **Smart Contract**: TradingVaultV2 at `0x59DF48cC80412453dCF96666e07EF81CdCC2d9b0`
- **Data Storage**: On-chain + localStorage (no backend DB)
- **Deployment**: ZIP download → manual upload to GoDaddy/Netlify

## V2 Vault
- Supports CRO (`withdrawTo`) and ERC-20 tokens (`withdrawTokenTo`)
- GANG token: `0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF`

## Completed Features (April 2026)
- [x] V2 Trading Vault deployed with ERC-20 support
- [x] 100% of mock transactions replaced with real on-chain vault calls
- [x] Parallel RPC reads + optimistic UI balance updates
- [x] Collapsible UI sections (Liquidity, Lending, Homepage)
- [x] Real auto-withdrawals for leverage TP/SL/Liquidation
- [x] NFT Staking with ERC-721 enumeration fallback
- [x] **Lightweight Charts migration** — entry price lines now FIXED at entry price, never drift
  - Timeframe selector: 1m, 5m, 15m, 1H, 4H, 1D
  - Shows Entry, Liquidation, TP, SL lines via `createPriceLine()`
  - Real-time candle updates from Binance kline WebSocket
  - Synthetic candles for non-crypto pairs
- [x] **Fixed auto-liquidation bug** — simulated prices were 20x too volatile, causing false liquidations when navigating away
  - Reduced volatility to realistic market levels
  - Added 60-second minimum hold period
  - Tightened mean-reversion to prevent runaway drift

## Known Issues
- Lost 19,179 GANG in V1 Vault (unsolvable — V1 lacks ERC-20 withdrawal)
- Chart cannot be screenshot-tested in headless Playwright (Canvas 2D limitation)

## Deployment Notes
- ZIP contains 2 files: `cronos-gangsters.html` + `lightweight-charts.js`
- HTML uses CDN by default; local JS file is a backup
- Both files go in the same folder on the hosting platform

## Upcoming (P1)
- CEX listings integration
- Further UI polish

## Future (P2)
- Multi-chain expansion (BNB Chain — postponed until Cronos is perfect)
- Fulcrom-style on-chain perpetuals smart contract
- Mobile App
