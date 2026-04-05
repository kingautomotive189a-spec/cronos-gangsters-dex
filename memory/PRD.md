# Cronos Gangsters DApp — PRD

## Architecture
- Single `cronos-gangsters.html` (~21,600 lines), vanilla JS + Ethers.js v6
- FastAPI (`server.py`) + Telegram Bot (`telegram_bot.py`)
- LocalStorage for all mocked DeFi state
- ZIP → GoDaddy manual deployment

## All Features Complete
Core DeFi, Advanced DeFi, World Domination (6 new features), Dynamic Copy Trading, Auto-Refresh Engine, Professional Token Logos, Pre-Seeded Lending Pools, Navigation Menu (7 categories), Custom 3-Stage Wallet Popup

## Latest: Fast Leverage Trading (Feb 5, 2026)
- **Micro-volatility simulation** every 1.5s between API calls — realistic random walk
- BTC swings $20-$80 per tick, not pennies
- **Momentum system** — prices trend in one direction before reversing (realistic feel)
- **Clamped to real price** — never drifts more than 0.5% from API anchor
- **API fetch every 5s** (was 10s) — faster real price updates
- **All position PnL updates every 1.5s** — visible profit/loss movement
- **Price flash color** — green/red flash on price change
- **All open positions tick** — not just the viewed pair
- Math: 100% verified (LONG/SHORT, 20x/15x, fees, liquidation all accurate)

## Leverage Math (Verified)
- Opening fee: `amount × 0.003` (0.3%)
- Position size: `amount - openingFee`
- LONG PnL: `(currentPrice - entryPrice) / entryPrice × leverage`
- SHORT PnL: `(entryPrice - currentPrice) / entryPrice × leverage`
- Closing fee: `positionSize × 0.003` (0.3%)
- Liquidation: 1/leverage price move = 100% loss

## Key Files
- `/app/frontend/public/cronos-gangsters.html`
- `/app/frontend/public/cronos-gangsters-deploy.zip` (12MB)
