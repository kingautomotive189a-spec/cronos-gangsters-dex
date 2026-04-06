# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a comprehensive Web3 DApp for the Cronos blockchain ecosystem. Single HTML file (`cronos-gangsters.html`) for manual GoDaddy upload.

**Critical Mandate:** "Make everything real. Whatever is fake and it can be real. Make it real." — ALL features must use real on-chain smart contracts with MetaMask transactions. No LocalStorage mocking.

## Architecture
- **Frontend**: Single HTML file (~24.4k lines) with vanilla JS, Ethers.js v6
- **Backend**: FastAPI for API proxy
- **Mining Hub**: `mining.html` with 4 Canvas games + backend-validated betting
- **Deployment**: ZIP file download for manual GoDaddy upload

## Smart Contracts — 6 Total (All Compiled, Embedded, Ready to Deploy)

| # | Contract | Purpose | Deploy Button |
|---|----------|---------|---------------|
| 1 | GANGNFTStaking | Stake NFTs, earn GANG, 0.3% claim fee | Revenue page |
| 2 | GANGBuybackBurn | Auto-buy GANG + burn, deflationary | Revenue page |
| 3 | GANGLendingPool | Supply/withdraw/borrow/repay GANG | Revenue page |
| 4 | GANGTradingPool | Leverage trading collateral deposits | Revenue page |
| 5 | GANGBondDepository | LP token bonding with 5-day vesting | Revenue page |
| 6 | GANGProtocolVault | Universal vault for all other features | Revenue page |

## Features Using Real On-Chain Contracts

### Via Dedicated Contracts (1-4):
- NFT Staking (stake/unstake/claim)
- Auto-Buyback & Burn
- Lending Pool (GANG supply/withdraw/borrow/repay)
- Leverage Trading (GANG collateral deposit/withdraw)

### Via Protocol Vault (6):
- Prediction Markets (bet placement)
- Flash Loans (execution fees)
- Insurance (premium payments)
- DEX Aggregator (routing fees)
- Copy Trading (copy fees)
- Revenue Staking (stake/unstake)
- Limit Orders (order placement)
- Perpetual DEX (margin deposits)
- OTC Trading (deal escrow)
- DAO Governance (proposal fees, vote deposits)
- Squad Farming (join fees)
- Trading Competitions (entry fees)
- POL Bonds (LP token deposits)

### Via Bond Depository (5):
- 8 Bond Pairs: CRO-GANG, USDC-GANG, WETH-GANG, WBTC-GANG, DAI-GANG, ATOM-GANG, USDT-GANG, VVS-GANG

### Already Real (Native Ethers.js):
- Token Swap (VVS Router)
- NFT Minting (CRO payment)
- Wallet Connection (MetaMask)

## Revenue Collection
All fee collection buttons on Revenue page use real on-chain `collectFees()` calls through the Protocol Vault contract.

## Mining Hub
- 4 HTML5 Canvas games (Road Racer, Shooting Gallery, Premium Slots, Drift Racer)
- Backend-validated betting (balance checked server-side)
- Client-side balance validation added to prevent invalid bets
- Real GANG deposits/withdrawals for funding/cashout

## Key Files
- `/app/frontend/public/cronos-gangsters.html` (~24.4k lines)
- `/app/frontend/public/mining.html`
- `/app/frontend/public/dashboard.html`
- `/app/backend/server.py`
- `/tmp/contracts/` — Compiled Solidity contracts

## Backlog
- P1: CEX listings integration
- P1: Multi-chain expansion
- P2: Mobile App
- P2: Deploy separate lending pools per token (non-GANG)
