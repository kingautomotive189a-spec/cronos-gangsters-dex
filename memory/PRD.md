# Cronos Gangsters DApp — PRD

## Overview
Single-file Web3 DApp for the Cronos blockchain. All UI, CSS, JS, ABIs, and smart contract interaction logic lives in one HTML file (`cronos-gangsters.html`).

## Architecture
- **Frontend**: `/app/frontend/public/cronos-gangsters.html` (~27,950 lines)
- **Chart Library**: TradingView Lightweight Charts v4.2 (CDN + local backup `lightweight-charts.js`)
- **Smart Contracts**:
  - TradingVaultV2: `0x59DF48cC80412453dCF96666e07EF81CdCC2d9b0`
  - GangRevenueStaking: Deploy required (bytecode embedded in HTML)
- **Data Storage**: On-chain + localStorage (no backend DB)
- **Deployment**: ZIP download -> manual upload to GoDaddy/Netlify

## Completed Features (April 2026)

### Session 3 (Current)
- [x] **Deleted Limit Orders page** — removed page, nav, JS, revenue panel, all references
- [x] **Deleted Perpetual DEX page** — duplicate of Leverage Trading, fully removed
- [x] **Lightweight Charts migration** — replaced TradingView iframe with native chart
  - Entry price lines now FIXED at entry price via `createPriceLine()` — never drift
  - Also shows Liquidation, TP, SL lines
  - Timeframe selector: 1m, 5m, 15m, 1H, 4H, 1D
  - Real-time candle updates from Binance kline WebSocket
  - Synthetic candles for non-crypto pairs
  - Magnet crosshair, disabled vertical touch drag to prevent mobile chaos
- [x] **Fixed auto-liquidation bug** — reduced simulated price volatility 20x, added 5s grace period
- [x] **DEX Aggregator — REAL** — now routes through VVS Finance Router (`0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae`)
  - Real on-chain quotes via `getAmountsOut`
  - Real swaps via `swapExactETHForTokens`, `swapExactTokensForETH`, `swapExactTokensForTokens`
  - Auto-approval for ERC-20 tokens
  - Supports CRO, GANG, USDC, USDT, WETH, VVS, TONIC, ATOM
- [x] **Revenue Staking — REAL CONTRACT** — `GangRevenueStaking.sol` compiled and bytecode embedded
  - Users stake GANG, earn CRO rewards proportionally
  - Owner deploys via one-click button in the app
  - Real on-chain `stake()`, `unstake()`, `claimReward()` calls
  - Owner can deposit CRO rewards with duration-based distribution

### Session 2
- [x] V2 Trading Vault deployed with ERC-20 support
- [x] 100% mock transactions replaced with real on-chain vault calls
- [x] Parallel RPC reads + optimistic UI balance updates
- [x] Collapsible UI sections (Liquidity, Lending, Homepage)
- [x] Real auto-withdrawals for leverage TP/SL/Liquidation
- [x] NFT Staking with ERC-721 enumeration fallback

## Deployment Notes
- ZIP contains 2 files: `cronos-gangsters.html` + `lightweight-charts.js`
- HTML uses CDN for chart library; local JS is backup
- Both files go in the same folder on hosting platform
- **Revenue Staking**: Owner must click "DEPLOY CONTRACT" button once in MetaMask

## Known Issues
- Lost 19,179 GANG in V1 Vault (unsolvable — V1 lacks ERC-20 withdrawal)
- Chart cannot be screenshot-tested in headless Playwright (Canvas 2D limitation)

## Upcoming (P1)
- CEX listings integration
- Further UI polish

## Future (P2)
- Multi-chain expansion (BNB Chain)
- Mobile App
