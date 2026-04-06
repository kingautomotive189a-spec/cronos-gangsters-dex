# Cronos Gangsters DApp — Product Requirements

## Original Problem Statement
Build a comprehensive Web3 DApp for Cronos blockchain as a single deployable HTML file. All features must use real on-chain smart contracts with MetaMask wallet confirmation for every transaction. No fake/localStorage-based transactions allowed.

## Architecture
- **Single-file deployment**: `/app/frontend/public/cronos-gangsters.html` (~25k lines)
- **Mining game**: `/app/frontend/public/mining.html`
- **Backend**: `/app/backend/server.py` (FastAPI)
- **Delivery**: ZIP file at `/app/frontend/public/cronos-gangsters-deploy.zip`
- **Chain**: Cronos Mainnet (chain ID 25)
- **Stack**: Vanilla HTML/CSS/JS, Ethers.js v6, TradingView widgets

## Deployed Smart Contracts
- GANG Token: `0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF`
- Trading Pool: `0xc7002e7c73d4910f0f83a66d187d2be951360619`
- Protocol Vault: `0x7bed7483eeb27c7cd85ba76dfb141290156138ea`
- Lending Pool: `0x48350cb22e119617e35c70c739e3b0df4c50c4e7`
- Bond Depository: `0x99fbe23cfc531d4501e160c84797425ea0a62be8`
- NFT Staking: `0x2027031e4967c5a5cfc1e2f966507bbebcfa3d73`
- Buyback & Burn: `0x7ab767ce485290cc134b84ea7f2fc16537dcfa67`
- GANG Staking: `0x03c3C706F0D2F4754755988A686a70E661e6925F`

## What's Been Implemented (Complete)

### Leverage Trading — 8 Token Pools (2026-04-06)
Added 6 new trading pools alongside GANG and CRO:
- BTC Pool (Bitcoin icon, orange theme)
- ETH Pool (Ethereum icon, blue theme)
- SOL Pool (Solana icon, green theme)
- BNB Pool (BNB icon, yellow theme)
- USDC Pool (USDC icon, blue theme)
- USDT Pool (Tether icon, teal theme)

Each pool has:
- Token icon from CoinGecko
- Pool Balance + Profit display
- Amount input field
- DEPOSIT and WITHDRAW buttons
- Real MetaMask confirmation (GANG/CRO via direct contracts, others via Protocol Vault)
- State persistence in localStorage
- Owner-only visibility

### On-Chain Real MetaMask Confirmations — ALL Features
Every feature requires MetaMask wallet confirmation. No fakes.

### Critical Bug Fixes Applied (2026-04-06)
1. `GANG_ADDR → GANG_TOKEN` in IIFE scope (4 places)
2. Flash Loan input ID fixed
3. DEX Aggregator input ID fixed
4. Insurance input ID fixed
5. Predictions input ID fixed (dynamic per market)
6. Copy Trading input ID fixed
7. CRO Lending Supply/Repay — sends native CRO via MetaMask
8. `vaultDeposit/vaultWithdraw/vaultCollectFees` exposed globally
9. Daily Check-in requires MetaMask
10. Squad Creation requires MetaMask
11. `confirmTx()` properly awaits async callbacks
12. NFT Staking added to hamburger navigation menu
13. Better error messages for failed transactions (shows TX hash)

## Upcoming Tasks
- P1: Finish wallet balance labels (Predictions, DAO, Bonds, Flash Loans, Revenue Seed Fund)
- P1: CEX listings
- P1: Multi-chain expansion
- P2: Mobile App

## Critical Rules
- NEVER split the HTML file
- Every transaction MUST trigger MetaMask
- Always rebuild ZIP after changes
- No localStorage for balances (only UI state)
