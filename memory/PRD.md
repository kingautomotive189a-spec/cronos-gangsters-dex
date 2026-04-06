# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a comprehensive Web3 DApp for the Cronos blockchain. Single HTML file for manual GoDaddy upload. **All features must be real on-chain with MetaMask transactions. No fakes.**

## Architecture
- Single HTML file (~24.7k lines) + Ethers.js v6
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

## Completed Work

### Apr 6, 2026 — Lending Page UI Redesign
- Replaced all 🏦 (bank/house) emoji icons on the Lending page with custom SVG icons (stacked coins, dollar sign, heartbeat pulse, download arrow, monitor, question circle, shield)
- Upgraded typography with a mixture approach: Bebas Neue for impact headers + Space Grotesk (new Google Font) for body text, labels, descriptions
- Enhanced visual polish: glassmorphic stat boxes, gradient pill badges, token glow effects, hover states on pool cards, input focus transitions
- Updated nav bar icon from generic credit card SVG to stacked coins SVG
- Updated marquee/ticker from 🏦 emoji to inline SVG icon

### Previous Work
- Replaced mocked POL Bonds with real GANGBondDepository contract (8 bond pairs with CoinGecko logos)
- Redirected swap fees (0.3%) to GANGProtocolVault, Revenue banners show real on-chain fees
- Enforced real token balance checks before Mining Hub Canvas games
- Added "CLEAR OLD POSITIONS" buttons for Leverage/Lending pages
- Rewrote lending overrides to support all 10 tokens on-chain via Protocol Vault
- Fixed broken token logos (VVS, TONIC) using correct CoinGecko/CMC URLs

## Bond Pairs (8 total)
CRO-GANG (8%), USDC-GANG (6%), WETH-GANG (10%), WBTC-GANG (12%), DAI-GANG (7%), ATOM-GANG (9%), USDT-GANG (5%), VVS-GANG (11%)

## Key Files
- `/app/frontend/public/cronos-gangsters.html` (~24.7k lines)
- `/app/frontend/public/mining.html`
- `/app/backend/server.py`

## Fonts Used
- Bebas Neue — Display/impact headers, stat values, APY numbers
- Space Grotesk — Body text, labels, descriptions (added Apr 6)
- Barlow Condensed — General body text
- Space Mono — Monospace for swap values, addresses

## Backlog
- P1: CEX listings
- P1: Multi-chain expansion
- P2: Mobile App
