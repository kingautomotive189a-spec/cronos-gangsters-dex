# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a comprehensive Web3 DApp for the Cronos blockchain ecosystem featuring token swaps, leverage trading, NFT marketplace, lending, and more. The entire application must remain a single deployable HTML file (`cronos-gangsters.html`) for manual GoDaddy upload.

**Critical Requirement (User Mandate):** "Make everything real, check my whole app. Whatever is fake and it can be real. Make it real." — All mocked/LocalStorage features must use real on-chain smart contracts with MetaMask transactions.

## Architecture
- **Frontend**: Single HTML file (`cronos-gangsters.html`, ~24k lines) with vanilla JS, Ethers.js v6, HTML5 Canvas
- **Backend**: FastAPI (`server.py`) for API proxy (CoinGecko, bot management)
- **Mining Hub**: Separate `mining.html` with 4 Canvas games
- **Bot Dashboard**: `dashboard.html` for Telegram bot control
- **Deployment**: ZIP file for manual GoDaddy upload
- **Smart Contracts**: 4 Solidity contracts compiled locally with `solcjs`, ABI/bytecode embedded in HTML

## Smart Contracts Deployed (Real On-Chain)
| Contract | Status | Constructor Args | Features |
|----------|--------|-----------------|----------|
| GANGNFTStaking | READY TO DEPLOY | (nftAddr, gangAddr, treasury) | Stake NFTs, earn GANG, 0.3% claim fee |
| GANGBuybackBurn | READY TO DEPLOY | (gangAddr, routerAddr) | Auto-buy GANG + burn, deflationary |
| GANGLendingPool | READY TO DEPLOY | (gangAddr) | Supply/withdraw/borrow/repay GANG |
| GANGTradingPool | READY TO DEPLOY | (gangAddr) | Deposit/withdraw GANG collateral for leverage, 0.3% fee |

## What's Been Implemented

### Completed Features
- Token Swap (Ethers.js + VVS Router)
- Liquidity Pool management
- TradingView live chart integration
- NFT Marketplace with minting
- Leverage Trading (33 pairs, up to 100x) — **GANG positions now ON-CHAIN**
- Perpetual DEX
- Copy Trading
- Flash Loans
- Trading Signals
- Staking (GANG token)
- Farms / Vaults
- Revenue Staking
- Lending & Borrowing (10 pools) — **GANG pool now ON-CHAIN**
- Lottery
- Prediction Markets
- Insurance Protocol
- DEX Aggregator
- OTC Trading
- POL Bonds
- VIP Tiers + Daily Check-in
- Squad Farming
- Trading Competitions
- Referral System
- Sniper Bot + Telegram integration
- Mining Hub (4 HTML5 Canvas games)
- Revenue Dashboard with fee collection
- Auto-Buyback & Burn mechanism

### Real On-Chain Migrations (Session 2 - April 2026)
1. **NFT Staking**: Real `ethers.ContractFactory` deployment, stake/unstake/claim via smart contract
2. **Buyback & Burn**: Real contract deployment, trigger buyback via MetaMask
3. **Lending Pool (GANG)**: Real supply/withdraw/borrow/repay through deployed contract. GANG pool marked "ON-CHAIN" in UI
4. **Leverage Trading Pool**: Real GANG collateral deposit/withdrawal. Positions opened with GANG trigger MetaMask for real token transfer
5. **Revenue page**: 4 deploy buttons (NFT Staking, Buyback, Lending, Trading Pool) — each triggers real mainnet deployment

### Still Mocked (LocalStorage)
- Lending pools for non-GANG tokens (CRO, USDC, WETH, etc.) — each would need its own contract deployment
- Squad Farming rewards
- POL Bond purchases
- Trading Competition leaderboards
- Prediction Markets resolution
- Insurance claims
- Flash Loan execution

## Key Files
- `/app/frontend/public/cronos-gangsters.html` — Core DApp (~24k lines)
- `/app/frontend/public/mining.html` — Mining Hub games
- `/app/frontend/public/dashboard.html` — Bot dashboard
- `/app/backend/server.py` — FastAPI backend
- `/tmp/contracts/` — Compiled Solidity contracts + ABI/bytecode

## 3rd Party Integrations
- Telegram Bot API (user-provided key)
- TradingView Widget (free)
- Dexscreener API (free)
- CoinGecko API (free, proxied through backend)

## Backlog
- P1: CEX listings integration
- P1: Multi-chain expansion (BSC, Ethereum, Base)
- P2: Mobile App
- P2: Deploy separate lending pools for each token
- P2: Migrate remaining mocked features to real contracts where applicable

## ZIP Delivery
Download: `/cronos-gangsters-deploy.zip` from the preview URL
