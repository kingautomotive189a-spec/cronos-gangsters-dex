# Cronos Gangsters DApp — PRD

## Architecture
- Single `cronos-gangsters.html` (~21,600 lines), vanilla JS + Ethers.js v6
- FastAPI (`server.py`) + Telegram Bot (`telegram_bot.py`)
- LocalStorage for all mocked DeFi state | ZIP → GoDaddy deployment

## All Features Complete
Core DeFi, Advanced DeFi, World Domination (6 features), Dynamic Copy Trading, Auto-Refresh Engine, Professional Token Logos, Pre-Seeded Lending Pools, Custom 3-Stage Wallet Popup, Navigation Menu (7 categories)

## Latest Changes (Feb 5, 2026)
- **"Gang Futures" → "Leverage Trading"** renamed everywhere: nav menu, page header, marquee, roadmap, telegram bot, revenue page, copy trading reference
- **Menu background**: Solid #0c0e18 dark (no more transparency/page bleed-through)
- **Menu gold border glow** enhanced
- **Page header**: "LEVERAGE TRADING" with "Live prices — auto-updates every 1.5s | Up to 100x leverage | 33 pairs"
- **Micro-volatility engine**: 1.5s ticks, $20-$80 BTC swings, momentum system, ±0.5% max drift
- **All math verified**: LONG/SHORT, 20x/15x, fees, liquidation accurate
- **Critical bug fixes**: position status field, case normalization for side

## Changes (Apr 5, 2026)
- **Complete "Futures" → "Leverage Trading" sweep**: Cleaned ALL remaining user-visible "Futures" text across entire app
  - Copy Trading page: "TOP LEVERAGE TRADERS", "Copy winning Leverage trades", position descriptions
  - Revenue page: Fee summary grid label, fee collection banner title/description, "GO TO LEVERAGE TRADING" button
  - Feature grid card: "LEVERAGE" label
  - Checklist: "Swaps & Leverage Trading"
  - JS strings: showTxConfirm titles, toast messages, points system
  - How You Earn section: all references updated
- **Telegram Bot**: Updated "Futures" button labels to "Leverage" in all inline keyboards, FAQ text updated, bot commands list updated
- **Token Logos in Dropdowns**: Converted DEX Aggregator (FROM/TO) and Flash Loans token selects from plain `<select>` to custom dropdowns with original token logos (CRO, USDC, WETH, GANG, WCRO, VVS, TONIC, ATOM)
- **WCRO added** to TOKEN_LOGOS registry
- **KYC & Audit Page**: Full "Security & Trust" page with GoPlus Security automated audit results (18 checks all passing), DEX listings, verification links (GoPlus, De.Fi, TokenSniffer, Cronoscan), contract details, and KYC "In Progress" status
- **Trading Signals Page**: NEW full page with REAL data from CoinGecko API — RSI, MACD, Stochastic, Williams %R, CCI, plus 8 Moving Averages (SMA/EMA). Token logos on every indicator row. Signal strength gauge, overall BUY/SELL recommendation, auto-refreshes every 60s. 12 tokens: BTC, ETH, CRO, SOL, BNB, XRP, ADA, DOGE, DOT, LINK, AVAX, MATIC
- **MAX Button Fix (Global)**: Fixed all MAX buttons across the entire app to truncate (floor) instead of rounding up. Added `_truncDec()` helper. Fixed: Farms LP withdraw, LP remove, Stake/Unstake, Leverage Trading, Copy Trading, Revenue Staking, Limit Orders, Perp DEX, OTC Trading, Flash Loans, Lending, Vaults. Also subtracts 0.5 CRO for gas on CRO-based MAX.
- **Leverage Trading Realistic Simulation Engine**: Replaced random bouncing with micro-trend system — each pair has 8-25 tick trends with proper momentum, smoothing, volatility spikes (simulating news events), mean reversion toward anchor price. Much more natural-looking price movement.
- **Backend CoinGecko Proxy**: Added `/api/coingecko/price` and `/api/coingecko/chart` endpoints with 30s cache to avoid CORS and rate limits
- **Telegram Bot `/security` command**: Shows all 18 GoPlus checks, KYC status, contract info, and verification links with inline buttons
- **Telegram Bot menu**: Added "KYC & Audit" button to main inline keyboard menu
- **ZIP delivered** for GoDaddy deployment

## Changes (Feb 2026 — Session 3)
- **Mining Hub Games Overhaul**: Replaced all old button-tap games (coin flip, dice, RPS, horse racing, car racing) with 4 new interactive canvas-based games:
  - **Road Racer**: Pseudo-3D perspective road, dodge traffic, collect GANG coins, multiplier increases with distance
  - **Shooting Gallery**: Tap ring targets, 30-second timer, streak tracking, pulsing animations
  - **Premium Slots**: 3-reel slot machine with animated spin, $G/7/Diamond/Cherry/Bar/Star symbols, backend-powered fairness
  - **Drift Racer**: Top-down oval track, 3 AI opponents, 3-lap race, position tracking, tire mark particles
- Games tab now shows "ARCADE GAMES" with game cards
- Racing tab now shows "RACING GAMES" with game cards
- All games use Canvas API with 60fps game loops, touch-friendly controls, proper HUD
- All games tie into backend API for fair bet/payout processing
- **Bot Dashboard API Fix**: Fixed `dashboard.html` API routing for GoDaddy deployment. Replaced hardcoded `window.location.origin` with configurable `BACKEND_URL` constant.
- **NFT Staking (JS Logic)**: Full stake/unstake/claim with rarity multipliers (Legendary 3x, Epic 2x, Rare 1.5x, Common 1x). 0.3% fee on claim. Live reward ticking. "Your NFTs Available to Stake" grid with quick-stake.
- **Auto-Buyback & Burn (JS Logic)**: Manual buyback trigger, deflationary stats (4.2M GANG burned, 12.7K CRO spent), auto 10% of all platform fees routed to buyback.
- **Daily Check-in (JS Logic)**: Streak tracking, week grid, tiered rewards (10 GANG base, +100 at week 1, +500 at day 14, +2000 at day 30), LocalStorage persistence.
- **VIP Tiers (JS Logic)**: 4 tiers (Bronze 10K, Silver 100K, Gold 1M, Diamond 10M GANG), auto-detects current tier from wallet balance, highlights active tier card.
- **Squad Farming (JS Logic)**: Create/join squads with codes, APY boost table (5-30%), 3 seeded demo squads, 0.3% fee on rewards.
- **POL Bonds (JS Logic)**: 3 bond pairs (CRO-GANG 8%, USDC-GANG 6%, WETH-GANG 10% discount), 5-day vesting with progress bar, claimable when vested, 0.3% fee.
- **Trading Competitions (JS Logic)**: Weekly 500K GANG prize pool, 100 GANG entry fee, countdown timer, top-3 leaderboard, participant count.
- **Revenue Page — New Banners**: NFT Staking Fees (0.3%), Auto-Buyback & Burn stats, POL Bond Fees (0.3%), Competition Entry Fees, Squad Farming Fees (0.3%).
- **Revenue Page — Contract Deployment**: "Deploy NFT Staking Contract" + "Deploy Buyback & Burn Contract" buttons with simulated tx hash.
- **Revenue Page — HOW YOU EARN**: Updated with 6 new fee streams.
- **Revenue Summary Grid**: Added NFT Staking, Buyback, Bonds, Competitions, Squad entries.
- **ZIP delivered** for GoDaddy deployment

## Key Files
- `/app/frontend/public/cronos-gangsters.html`
- `/app/frontend/public/dashboard.html`
- `/app/frontend/public/cronos-gangsters-deploy.zip`
