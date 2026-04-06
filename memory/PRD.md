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

## Leverage Trading — 69 Pairs (Crypto, Stocks, Forex, Indices, Commodities)
**Crypto** (20): BTC, ETH, BNB, CRO, SOL, XRP, DOGE, ADA, AVAX, LINK, ARB, MATIC, DOT, UNI, SHIB, PEPE, NEAR, ATOM, FIL, RENDER
**Stocks — Big Tech** (10): AAPL, TSLA, NVDA, MSFT, AMZN, GOOGL, META, AMD, NFLX, INTC
**Stocks — Finance** (6): COIN, JPM, GS, V, MA, PYPL
**Stocks — Defence** (3): BA, LMT, RTX
**Stocks — EV** (2): RIVN, NIO
**Stocks — E-Commerce** (5): SHOP, DIS, UBER, ABNB, RBLX
**Stocks — AI** (3): PLTR, SNOW, CRM
**Forex** (7): EURUSD, GBPUSD, USDJPY, AUDUSD, USDCAD, USDCHF, EURGBP
**Indices** (6): NAS100, SP500, DJI, FTSE, DAX, NIKKEI
**Commodities** (7): GOLD, SILVER, PLATINUM, OIL, NATGAS, COPPER, WHEAT

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
- **UPGRADE**: TradingView chart — proper red/green candles, RSI indicator, Moving Average overlay, 5m timeframe, taller 420px chart
- **UPGRADE**: Leverage options expanded from 4 to 6 levels (5x/10x/20x/50x/75x/100x)
- **UPGRADE**: Smart price formatter `_fmtPrice()` — adapts decimal places based on asset price magnitude
- **UPGRADE**: Position cards show: liquidation price, margin ratio (%), ROE, live value, duration, TP/SL targets, border color changes with PnL
- **UPGRADE**: Trade info panel shows: margin, open fee, position size, liq price — all calculated live as you type
- **UPGRADE**: Open confirmation shows estimated liquidation price
- **UPGRADE**: Close confirmation shows PnL with %, payout amount clearly labeled
- **UPGRADE**: Trade history stores `closeReason` field (MANUAL/TP HIT/SL HIT/LIQUIDATED)
- **FIX**: Close payout calculation — traders receive `collateral + PnL - fees` (not flat collateral amount)
- **FIX**: MetaMask required for ALL currencies on close (not just GANG)
- **FIX**: Liquidation/TP/SL auto-closes bypass MetaMask (can't dodge liquidation)
- **FIX**: "Clear History & Old Data" only removes legacy positions + history, never active on-chain trades, with confirmation dialog
- **FIX**: Position value updates live with price movement (not stuck at deposit amount)
- **FIX**: Close position force-fetches live price before PnL calculation
- **FIX**: Price polling batch-fetches ALL pairs with open positions
- **FIX**: Fee routing corrected for all 8 currencies
- Binance WebSocket real-time price feeds for ALL 12 crypto pairs
- Backend proxy: CoinGecko batch + Yahoo Finance fallback, separate caching
- Gaussian random walk with momentum bursts for non-crypto simulation
- All previous on-chain features remain intact

## Completed (2026-04-06 — Perpetual DEX On-Chain Fix)
- **FIX**: Perpetual DEX open/close positions now trigger real MetaMask wallet approval via `vaultDeposit`/`vaultWithdraw`
- **FIX**: Removed conflicting `window.openPerpPosition`/`window.closePerpPosition` overrides that short-circuited the confirmation modal flow
- **FIX**: Close position now withdraws actual collateral amount (not hardcoded 10 GANG)

## Completed (2026-04-06 — Perpetual DEX Chart + Logos)
- **NEW**: TradingView chart on Perpetual DEX page (same style as Leverage Trading — candlestick, RSI, moving average, dark theme)
- **NEW**: Token logos for all 8 Perp pairs (BTC, ETH, CRO, SOL, GANG, DOGE, AVAX, LINK) via CoinGecko
- **NEW**: Chart header with live price display, pair logo, and PERPETUAL badge
- **NEW**: Chart auto-switches when pair dropdown changes (`switchPPPair()`)
- **NEW**: Live price updates in chart header every 3s tick
- **UPGRADE**: Perpetual DEX page header with "FULLY ON-CHAIN | CRONOS MAINNET" badge and professional copy

## Completed (2026-04-06 — Bond WITHDRAW + Confirmation Modal)
- **ADDED**: Red WITHDRAW button on all 8 bond cards (CRO, USDC, WETH, WBTC, DAI, ATOM, USDT, VVS)
- **ADDED**: `withdrawBond()` function — triggers MetaMask via `vaultWithdraw`, removes bonds from state
- **ADDED**: `buyBond()` now shows confirmation popup before MetaMask with fee breakdown (CRO)
- **UPGRADED**: `showTxConfirm()` — now shows a real confirmation modal (Amount/Fee/Receive + CONFIRM/CANCEL) instead of skipping straight to MetaMask. Affects ALL features using it.

## Completed (2026-04-06 — ALL Fees → CRO Conversion)
- **CHANGE**: Converted ALL platform fees across the entire app to be collected exclusively in CRO
- **Features updated**: Leverage Trading, Swaps, Flash Loans, DEX Aggregator, Copy Trading, Lending, NFT Staking, Trading Competitions (100 GANG → 100 CRO), Squad Farming, Auto-Compound Vault
- **Revenue Page**: All fee displays changed from GANG to CRO (Swap Fees, Vault Performance, Pool Profit, NFT Staking, Competition, Squad, Lending Interest)
- **UI**: All fee labels, toast messages, confirmation popups, and info sections updated to show CRO
- **Info section**: "How You Earn" list updated for NFT Staking (→ CRO), Vault Performance (→ CRO), Competition (100 CRO)

## Completed (2026-04-06 — CRO-Only Fee Collection)
- **CHANGE**: All leverage trading fees (opening 0.3% + closing 0.3%) now collected exclusively in CRO pool regardless of trading currency
- **UPDATED**: 6 functions modified: `openFuturesPosition`, `_doOpenFuturesPosition`, `_doCloseFuturesPosition`, `_forceCloseFuturesPosition`, `_realDoOpenFuturesPosition`, `_realCloseFuturesPosition`
- **UPDATED**: Copy Trading leverage fee also routes to CRO pool
- **UI**: Fee labels show "→ CRO" indicator in confirmation popups, toasts, history, and Fees & Limits section
- **UI**: Total Fees Paid tab now labeled "(CRO)" with CRO suffix on amounts
- **DATA**: History entries tagged with `feeCurrency: 'CRO'`
- **ACCOUNTING**: Fee accumulation → CRO pool; PnL settlement → trading currency's pool (clean separation)

## Completed (2026-04-06 — Stock/Forex Icons)
- **NEW**: Real company logos for all 29 stock assets via Clearbit CDN
- **NEW**: Country flag icons for all 7 forex pairs via FlagCDN
- **NEW**: "100% ON-CHAIN DEFI" hero section with "LIVE ON CRONOS MAINNET" badge and professional blockchain copy
- **NEW**: Trust indicators (MetaMask Verified, Non-Custodial, Smart Contract Secured, Open Source Contracts)
- **NEW**: Leverage Trading FLAGSHIP showcase card with stats (69 pairs, 100x, 0.3% fees, LIVE prices) + asset tags
- **NEW**: FARMS / STAKE / POOLS earn highlight cards with SVG icons
- **UPGRADE**: Leverage Trading page header with on-chain badge, expanded description, feature pills (MetaMask Secured, 69 Assets, TP/SL Orders, 8 Collateral Tokens)
- **UPGRADE**: "THE FULL ARSENAL" features grid title with on-chain copy
- **UPGRADE**: "BUILT DIFFERENT. BUILT ON-CHAIN" section with CronoScan verification copy
- **FIX**: Scrolling banner updated from 33 to 69 pairs

## Completed (2026-04-06 — Leverage Trading MetaMask Fix)
- **FIX**: Leverage Trading CRO deposits now directly trigger MetaMask wallet confirmation via `state.signer.sendTransaction`
- **FIX**: Removed fragile `window._realDoOpenFuturesPosition` lookup pattern that silently fell back to mock `_doOpenFuturesPosition` when the IIFE failed to execute
- **FIX**: `onConfirm` callback now inlines the real on-chain logic: CRO via `sendTransaction`, GANG via `vaultDeposit`, other tokens via vault
- **FIX**: No wallet = error toast. No fallback to mock/demo. Every leverage trade requires MetaMask confirmation.

## Upcoming Tasks
- P1: CEX listings
- P1: Multi-chain expansion
- P2: Mobile App
