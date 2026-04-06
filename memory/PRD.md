# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a comprehensive Web3 DApp for the Cronos blockchain. Single HTML file for manual GoDaddy upload. **All features must be real on-chain with MetaMask transactions. No fakes.**

## Architecture
- Single HTML file (~25k lines) + Ethers.js v6
- FastAPI backend for API proxy
- Mining Hub (`mining.html`) with 4 Canvas games
- ZIP delivery or Emergent Deploy

## Smart Contracts — 6 Deployed on Cronos Mainnet

| Contract | Address | Purpose |
|----------|---------|---------|
| NFT Staking | `0x2027031e4967c5a5cfc1e2f966507bbebcfa3d73` | Stake NFTs, earn GANG |
| Buyback & Burn | `0x7ab767ce485290cc134b84ea7f2fc16537dcfa67` | Auto-buy + burn GANG |
| Lending Pool | `0x48350cb22e119617e35c70c739e3b0df4c50c4e7` | Supply/withdraw/borrow/repay |
| Trading Pool | `0xc7002e7c73d4910f0f83a66d187d2be951360619` | Leverage trading collateral |
| Bond Depository | `0x99fbe23cfc531d4501e160c84797425ea0a62be8` | LP bonding with 5-day vesting |
| Protocol Vault | `0x7bed7483eeb27c7cd85ba76dfb141290156138ea` | Universal vault for all features |

## Completed Work

### Apr 6, 2026 — Critical Balance Check Fix
- Added real on-chain token balance verification BEFORE every deposit/supply/stake across ALL features
- Fixed: Users could previously "supply" tokens they didn't own (USDC, WETH etc.) — now blocked with "Insufficient balance" error
- Balance checks added to: Lending Supply, Lending Repay, Leverage Trading (GANG + CRO), vaultDeposit (Revenue Staking, Limit Orders, Perp DEX, OTC, DAO)

### Apr 6, 2026 — Deploy Banners & Fake Position Cleanup
- Replaced deploy buttons with clean "DEPLOYED" green badges for all 6 contracts
- Applied Space Grotesk typography to Leverage Trading page
- Auto-clear ALL fake localStorage positions on first load (leverage, lending, revenue staking, predictions, etc.)
- Fixed input ID mismatches: rsStakeAmount, ppCollateral (were rsStakeAmt, ppMargin)

### Apr 6, 2026 — Contract Addresses Hardcoded
- ALL 6 contract addresses hardcoded in CONTRACTS object — works on every device/browser

### Apr 6, 2026 — Lending Page UI Redesign
- Replaced house/bank emoji icons with SVG icons
- Upgraded typography: Bebas Neue headers + Space Grotesk body

## Key Files
- `/app/frontend/public/cronos-gangsters.html` (~25k lines)
- `/app/frontend/public/mining.html`
- `/app/backend/server.py`

## Backlog
- P1: CEX listings
- P1: Multi-chain expansion
- P2: Mobile App
