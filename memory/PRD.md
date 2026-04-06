# Cronos Gangsters DApp — Product Requirements Document

## Original Problem Statement
Build a comprehensive Web3 DApp for the Cronos blockchain. Single HTML file for manual GoDaddy upload. **All features must be real on-chain with MetaMask transactions. No fakes.**

## Architecture
- Single HTML file (~24.7k lines) + Ethers.js v6
- FastAPI backend for API proxy
- Mining Hub (`mining.html`) with 4 Canvas games
- ZIP delivery for GoDaddy

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

### Apr 6, 2026 — Contract Addresses Hardcoded
- ALL 6 contract addresses now hardcoded in CONTRACTS object — works on every device/browser without localStorage
- Added "SHOW MY DEPLOYED ADDRESSES" button to Revenue page
- Added "IMPORT ADDRESSES (NEW DEVICE)" feature for manual address transfer
- Fixed localStorage key mismatches (GANG_LENDING_ADDR, GANG_BOND_DEPOSITORY_ADDR)

### Apr 6, 2026 — Lending Page UI Redesign
- Replaced house/bank emoji icons with custom SVG icons (stacked coins, dollar sign, etc.)
- Upgraded typography: Bebas Neue headers + Space Grotesk body text
- Enhanced visual polish: glassmorphic backgrounds, token glow effects, hover states

### Previous Work
- Replaced mocked POL Bonds with real GANGBondDepository contract (8 bond pairs)
- Redirected swap fees (0.3%) to GANGProtocolVault
- Enforced real token balance checks before Mining Hub Canvas games
- Added "CLEAR OLD POSITIONS" buttons for Leverage/Lending pages
- Rewrote lending overrides to support all 10 tokens on-chain

## Fonts Used
- Bebas Neue — Display/impact headers
- Space Grotesk — Body text, labels, descriptions
- Barlow Condensed — General body
- Space Mono — Monospace for values/addresses

## Key Files
- `/app/frontend/public/cronos-gangsters.html` (~24.7k lines)
- `/app/frontend/public/mining.html`
- `/app/backend/server.py`

## Backlog
- P1: CEX listings
- P1: Multi-chain expansion
- P2: Mobile App
