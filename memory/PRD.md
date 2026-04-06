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

### Core DeFi Features
- Swap, Farm, Vault, Staking, Lending, Bonds
- Leverage Trading with real on-chain collateral
- All 6 contract addresses hardcoded for cross-device support
- Auto-cleanup of legacy localStorage "fake" data
- Premium typography (Bebas Neue + Space Grotesk)

### On-Chain Real MetaMask Confirmations — ALL Features (2026-04-06)
Every feature now requires MetaMask wallet confirmation:
- **Leverage Trading**: open/close positions, owner pool deposit (seedLiquidity) / withdraw (withdrawCollateral)
- **Lending**: supply/withdraw/borrow/repay for ALL tokens including CRO (native CRO via direct tx)
- **Predictions**: place bets via Protocol Vault
- **Flash Loans**: execute + fee payment via Protocol Vault
- **Insurance**: buy coverage via Protocol Vault
- **DEX Aggregator**: swap fees via Protocol Vault
- **Copy Trading**: fees via Protocol Vault
- **Revenue Staking**: stake/unstake via Protocol Vault
- **Limit Orders**: escrow via Protocol Vault
- **Perpetual DEX**: margin via Protocol Vault
- **OTC Trading**: escrow via Protocol Vault
- **DAO Governance**: propose/vote fees via Protocol Vault
- **Bonds**: buy bonds via Protocol Vault
- **Daily Check-in**: MetaMask self-tx confirmation
- **Squad Creation/Join**: MetaMask or vault deposit confirmation
- **Trading Competitions**: entry fee via Protocol Vault
- **All Fee Collections**: via Protocol Vault collectFees()
- **Revenue Seed Fund**: add funds to any pool via Protocol Vault

### Critical Bug Fixes Applied (2026-04-06)
1. `GANG_ADDR → GANG_TOKEN` in IIFE scope (4 places) — was breaking Revenue Staking, Perp DEX, all vault deposits, Bonds
2. Flash Loan input ID: `flashLoanAmount → flashAmount`
3. DEX Aggregator input ID: `aggSwapAmount → aggAmount`
4. Insurance input ID: `insCoverAmount → insCoverageAmount`
5. Predictions input ID: `predBetAmt → predBet_${marketId}` (dynamic)
6. Copy Trading input ID: `copyTradeAmount → ctAmount`
7. CRO Lending Supply: sends native CRO via MetaMask (was blocking)
8. CRO Lending Repay: sends native CRO via MetaMask (was blocking)
9. `vaultDeposit/vaultWithdraw/vaultCollectFees` exposed globally via `window.*`
10. Daily Check-in: now requires MetaMask self-tx
11. Squad Creation: now requires MetaMask/vault deposit
12. `confirmTx()` now properly `await`s async callbacks
13. Leverage Owner Pool deposit/withdraw converted to real on-chain
14. Lending Owner Fee Collection converted to real on-chain
15. NFT Staking added to hamburger navigation menu

## Wallet Balance Labels (Pending from earlier session)
- Completed: Leverage, Lending, OTC, Limit Orders, Perp, Insurance
- Remaining: Predictions, DAO, Bonds, Flash Loans, Revenue Seed Fund

## Upcoming Tasks
- P1: Finish wallet balance labels above remaining input fields
- P1: CEX listings
- P1: Multi-chain expansion
- P2: Mobile App

## Critical Rules
- NEVER split the HTML file
- Every transaction MUST trigger MetaMask
- Always rebuild ZIP after changes
- No localStorage for balances (only UI state)
