# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a massive Web3 DApp as a single standalone HTML file for GoDaddy deployment. Features include DeFi protocols (Swap, Lending, Futures, etc.), NFTs, Telegram Bot integration, and revenue collection for the owner.

## Architecture
- **Frontend**: Single `cronos-gangsters.html` file (~20,700 lines), vanilla JS + Ethers.js v6
- **Backend**: FastAPI (`server.py`) + Python Telegram Bot (`telegram_bot.py`)
- **Storage**: LocalStorage (mocked DeFi state), no database
- **Deployment**: User downloads ZIP → uploads to GoDaddy manually

## Completed Features (All Phases 1-9)
### Core DeFi
- Swap, Liquidity, Farms, Vaults, Staking, Lottery
- Token Creator, Launchpad, LP Locker, Sniper Bot
- NFT Minting & Marketplace, Referral System
- GANG Futures, GANG Tracker, Bridge

### Phase 8 — Advanced DeFi (Completed)
- Lending & Borrowing (20% interest share, 0.3% origination, 5% liquidation)
- Prediction Markets (5% of resolved pots)
- Flash Loans (0.3% fee per loan)
- Insurance Protocol (2-5% premiums)
- DEX Aggregator (0.3% routing fee across 6 DEXs)
- Custom wallet-style `showTxConfirm()` popup for all mocked features

### Phase 9 — World Domination (Completed Feb 5, 2026)
- **Copy Trading** — Follow top traders, 0.3% fee per copied trade
- **Revenue-Sharing Staking** — Stake GANG, earn proportional platform fees, 0.3% mgmt fee
- **Limit Orders** — Buy/sell at target price, 0.3% execution fee
- **Perpetual DEX** — No-expiry contracts, up to 50x leverage, 0.3% open/close fee
- **OTC Trading Desk** — Large block trades with escrow, 0.3% per deal
- **DAO Governance** — Create proposals (1 CRO fee), vote with GANG, quorum 10,000

### Integration Completeness (All features have)
- Nav button with SVG icon
- 2x Scrolling ticker entries
- Feature grid box on main page
- Revenue summary tile (fee percentage)
- Revenue COLLECT banner with button
- HOW YOU EARN entry
- HTML Roadmap entry (Phase 9 COMPLETE)
- Telegram bot: command handler, callback handler, keyboard button, roadmap update
- `showTxConfirm()` modal for all mocked actions
- LocalStorage state management
- Owner panel (visible when treasury wallet connected)

## Fee Structure
| Feature | Fee | Type |
|---------|-----|------|
| Swap | 0.3% | On-chain |
| Lending Origination | 0.3% | Mocked |
| Lending Interest | 20% share | Mocked |
| Liquidation | 5% | Mocked |
| Predictions | 5% of pot | Mocked |
| Flash Loans | 0.3% | Mocked |
| Insurance | 2-5% premium | Mocked |
| DEX Aggregator | 0.3% routing | Mocked |
| Copy Trading | 0.3% per copy | Mocked |
| Rev Staking Mgmt | 0.3% on distributions | Mocked |
| Limit Orders | 0.3% per fill | Mocked |
| Perpetual DEX | 0.3% open/close | Mocked |
| OTC Trading | 0.3% per deal | Mocked |
| DAO Governance | 1 CRO per proposal | Mocked |

## Backlog / Phase 10 (Future)
- CEX listings
- Multi-chain expansion (ETH, BSC)
- Mobile App (iOS & Android)
- Gangster NFT Gallery with rarity & trait filters
- Top Collections leaderboard

## Testing Status
- Iteration 5: 100% pass (pre-Phase 9)
- Iteration 6: 100% pass (14/14 tests, all 6 new features verified)

## Key Files
- `/app/frontend/public/cronos-gangsters.html` — Main DApp (20,700+ lines)
- `/app/backend/telegram_bot.py` — Telegram Bot (3,300+ lines)
- `/app/backend/server.py` — FastAPI server
- `/app/frontend/public/cronos-gangsters-package.zip` — Deployable package
