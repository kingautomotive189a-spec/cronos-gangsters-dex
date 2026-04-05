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
- **ZIP delivered** for GoDaddy deployment

## Key Files
- `/app/frontend/public/cronos-gangsters.html`
- `/app/frontend/public/cronos-gangsters-deploy.zip`
