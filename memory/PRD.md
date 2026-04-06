# Cronos Gangsters DApp — Product Requirements

## Original Problem Statement
Build a comprehensive Web3 DApp for Cronos blockchain as a single deployable HTML file. All features must use real on-chain smart contracts with MetaMask wallet confirmation for every transaction.

## Architecture
- **Single-file deployment**: `/app/frontend/public/cronos-gangsters.html` (~25k lines)
- **Delivery**: ZIP file at `/app/frontend/public/cronos-gangsters-deploy.zip`
- **Chain**: Cronos Mainnet (chain ID 25)
- **Stack**: Vanilla HTML/CSS/JS, Ethers.js v6, TradingView widgets

## Deployed Smart Contracts
- GANG Token: `0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF`
- Trading Pool: `0xc7002e7c73d4910f0f83a66d187d2be951360619`
- Protocol Vault: `0x7bed7483eeb27c7cd85ba76dfb141290156138ea`

## Leverage Trading — 33 Pairs (Crypto, Stocks, Indices, Commodities)
**Crypto** (12): BTC, ETH, BNB, CRO, SOL, XRP, DOGE, ADA, AVAX, LINK, ARB, MATIC
**Stocks** (14): AAPL, TSLA, NVDA, MSFT, AMZN, GOOGL, META, AMD, NFLX, COIN, DIS, PYPL, BA, JPM
**Indices & Commodities** (7): NAS100, SP500, DJI, GOLD, SILVER, OIL, NATGAS

## Real-Time Price Feed System (2026-04-06)
**Crypto Pairs** — 3-tier fallback:
1. **Binance WebSocket** (`wss://stream.binance.com:9443`) — sub-second real-time streaming for all 12 crypto pairs (auto-mapped from FUTURES_PAIRS). LIVE badge pulses when active.
2. **Backend Proxy** (CoinGecko + Yahoo Finance at `/api/futures/prices`) — 5s polling fallback. 10s crypto cache, 30s non-crypto cache.
3. **Direct Binance/CoinGecko REST** from browser — when backend is unavailable.

**Non-Crypto Pairs** — Backend Yahoo Finance proxy with Gaussian random walk simulation between polls for natural price movement.

**Key Design**: ALL crypto prices are real market data. No simulated movement for any crypto pair. Non-crypto pairs use realistic Gaussian volatility with momentum bursts.

## All On-Chain Features (MetaMask Required)
- Leverage Trading (8 tokens), Lending, Predictions, Flash Loans
- Insurance, DEX Aggregator, Copy Trading, Revenue Staking
- Limit Orders, Perpetual DEX, OTC Trading, DAO Governance
- Bonds, Daily Check-in, Squads, Trading Competitions
- All Fee Collections, Revenue Seed Fund

## Completed (2026-04-06)
- **CRITICAL FIX**: Close position now FORCE fetches live price from API before calculating PnL — positions no longer close at entry price
- **CRITICAL FIX**: Fee routing fixed for BTC/ETH/SOL/BNB/USDC/USDT — fees now credit correct currency pool, not GANG pool
- **CRITICAL FIX**: Price polling now batch-fetches ALL pairs with open positions (not just the currently selected pair)
- Close confirmation popup fetches live price from backend API before showing PnL estimate
- localStorage cleanup version bumped to v3 (clears stale positions on next load)
- Binance WebSocket real-time price feeds for ALL 12 crypto pairs (auto-built from FUTURES_PAIRS)
- Fast reverse-lookup symbol mapping for WebSocket messages
- LIVE badge on price display for crypto pairs with active WebSocket
- PnL update throttling via requestAnimationFrame
- Backend proxy upgraded: CoinGecko batch + Yahoo Finance fallback, separate crypto/non-crypto caching
- Gaussian random walk with momentum bursts for non-crypto pair simulation
- ZIP deployment file generated
- Wallet balance labels in ALL 8 missing UI locations
- All 16+ showTxConfirm callbacks rewired to on-chain functions
- vaultDeposit/vaultWithdraw throw strict errors
- Leverage Trading switched to Protocol Vault contract
- Removed all 28 fake showTxConfirm popups
- Built real price-fetch trade confirmation modal for 6 trading features
- Multi-Token Lending Vault smart contract compiled and deployed
- ADD POOL LIQUIDITY UI for Lending
- 100% ON-CHAIN info panel and changelog in sidebar
- Fixed closed position persistence bug in Leverage Trading

## Upcoming Tasks
- P1: CEX listings
- P1: Multi-chain expansion
- P2: Mobile App
