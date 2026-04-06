# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a comprehensive Web3 DApp for the Cronos blockchain. Single HTML file for manual GoDaddy upload. **All features must be real on-chain with MetaMask transactions. No fakes.**

## Architecture
- Single HTML file (~24.5k lines) + Ethers.js v6
- FastAPI backend for API proxy
- Mining Hub (`mining.html`) with 4 Canvas games
- ZIP delivery for GoDaddy

## Smart Contracts — 6 Total

| Contract | Purpose | Fees |
|----------|---------|------|
| GANGNFTStaking | Stake NFTs, earn GANG | 0.3% claim fee |
| GANGBuybackBurn | Auto-buy + burn GANG | Burns 10% of fees |
| GANGLendingPool | Supply/withdraw/borrow/repay | 20% interest + 0.3% origination |
| GANGTradingPool | Leverage trading collateral | 0.3% open + close |
| GANGBondDepository | LP bonding with 5-day vesting | 0.3% per bond |
| GANGProtocolVault | Universal vault for all features | 0.3% per deposit |

## Revenue Flow — How You Get Paid

| Feature | Fee | Where It Goes | How to Collect |
|---------|-----|--------------|----------------|
| **Swaps** | 0.3% | Treasury wallet (auto) | Already in your wallet! |
| **Leverage Trading** | 0.3% open/close | Trading Pool contract | "Collect Trading Fees" button |
| **NFT Staking** | 0.3% on claims | Treasury wallet (auto) | Already in your wallet! |
| **Lending** | 20% interest, 0.3% origination | Lending Pool contract | "Collect Lending Fees" |
| **Predictions** | 5% of pot | Protocol Vault | "Collect Prediction Fees" |
| **Flash Loans** | 0.3% per loan | Protocol Vault | "Collect Flash Fees" |
| **Insurance** | 2-5% premiums | Protocol Vault | "Collect Insurance Fees" |
| **DEX Aggregator** | 0.3% routing | Protocol Vault | "Collect Aggregator Fees" |
| **Copy Trading** | 0.3% per copy | Protocol Vault | "Collect Copy Fees" |
| **Revenue Staking** | 0.3% management | Protocol Vault | "Collect RS Fees" |
| **Limit Orders** | 0.3% per fill | Protocol Vault | "Collect LO Fees" |
| **Perp DEX** | 0.3% per trade | Protocol Vault | "Collect Perp Fees" |
| **OTC Trading** | 0.3% per deal | Protocol Vault | "Collect OTC Fees" |
| **DAO** | 100 GANG/proposal | Protocol Vault | "Collect DAO Fees" |
| **POL Bonds** | 0.3% per bond | Protocol Vault | "Collect Bond Fees" |
| **Competitions** | Entry fees | Protocol Vault | "Collect Comp Fees" |
| **Squad Farming** | 0.3% on rewards | Protocol Vault | "Collect Squad Fees" |

## Revenue Dashboard Features
- Live on-chain treasury balance (GANG + CRO)
- Per-feature fee balances read from Protocol Vault
- "COLLECT ALL PROTOCOL VAULT FEES" master button
- All banners show ON-CHAIN badge
- "HOW YOU EARN" breakdown section

## Bond Pairs (8 total)
CRO-GANG (8%), USDC-GANG (6%), WETH-GANG (10%), WBTC-GANG (12%), DAI-GANG (7%), ATOM-GANG (9%), USDT-GANG (5%), VVS-GANG (11%)

## Key Files
- `/app/frontend/public/cronos-gangsters.html` (~24.5k lines)
- `/app/frontend/public/mining.html`
- `/app/frontend/public/dashboard.html`
- `/app/backend/server.py`

## Backlog
- P1: CEX listings
- P1: Multi-chain expansion
- P2: Mobile App
