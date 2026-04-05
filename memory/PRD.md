# Cronos Gangsters DApp — PRD

## Architecture
- Single `cronos-gangsters.html` (~21,540 lines), vanilla JS + Ethers.js v6
- FastAPI (`server.py`) + Telegram Bot (`telegram_bot.py`)
- LocalStorage for all mocked DeFi state
- ZIP → GoDaddy manual deployment

## All Features Complete
Core DeFi, Advanced DeFi (Lending, Predictions, Flash Loans, Insurance, DEX Aggregator), World Domination (Copy Trading, Revenue Staking, Limit Orders, Perpetual DEX, OTC, DAO), Dynamic Copy Trading + Auto-Refresh, Professional Token Logos, Pre-Seeded Lending Pools, Navigation Menu Overhaul (7 categories)

## Critical Bug Fixes (Feb 5, 2026)
- **Position status field**: Added `status: 'open'` to new Futures positions; Copy Trading now also accepts positions without status field (backward compat)
- **Case normalization**: Copy Trading PnL now normalizes side to uppercase before comparing (`'long'` vs `'LONG'`) — was causing wrong PnL direction
- **Futures display**: Normalized side comparison in position rendering and TP/SL/liquidation checks

## Leverage Math (Verified)
- Opening fee: `amount × 0.003` (0.3%)
- Position size: `amount - openingFee`
- LONG PnL: `(currentPrice - entryPrice) / entryPrice × leverage`
- SHORT PnL: `(entryPrice - currentPrice) / entryPrice × leverage`
- Closing fee: `positionSize × 0.003` (0.3%)
- Liquidation: when loss ≥ 100% of position (1/leverage price move)
- All verified with BTC LONG 20x and ETH SHORT 15x scenarios

## Key Files
- `/app/frontend/public/cronos-gangsters.html`
- `/app/frontend/public/cronos-gangsters-deploy.zip` (12MB)
