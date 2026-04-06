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
1. All core DeFi features (Swap, Farm, Vault, Staking, Lending, Bonds)
2. Leverage Trading with real on-chain collateral
3. Premium typography (Bebas Neue + Space Grotesk)
4. All 6 contract addresses hardcoded for cross-device support
5. Auto-cleanup of legacy localStorage "fake" data
6. Strict real token balance checks before all transactions
7. Real MetaMask wallet confirmations for ALL features
8. Revenue dashboard with ADD FUNDS for all pools

## Critical Fixes Applied (2026-04-06)
- **GANG_ADDR -> GANG_TOKEN**: Fixed 4 broken references in IIFE scope that caused "GANG_ADDR is not defined" across Revenue Staking, Perpetual DEX, all vaultDeposit calls, and Bonds
- **Flash Loan input ID**: Fixed wrong input element ID (flashLoanAmount -> flashAmount)
- **DEX Aggregator input ID**: Fixed wrong input element ID (aggSwapAmount -> aggAmount)
- **CRO Lending Supply**: No longer blocks CRO — sends native CRO via MetaMask
- **vaultDeposit/vaultWithdraw/vaultCollectFees exposed globally**: External IIFEs (Competitions, Squads) can now call real on-chain vault functions
- **Daily Check-in**: Now triggers real MetaMask self-tx for confirmation
- **Squad Creation**: Now requires MetaMask confirmation or vault deposit
- **confirmTx() async support**: TX confirmation modal now properly awaits async callbacks
- **Leverage Owner Pool Deposit/Withdraw**: Converted from fake localStorage to real on-chain (seedLiquidity/withdrawCollateral)
- **Lending Owner Fee Collection**: Converted from fake to real on-chain via vaultCollectFees

## All Features Using Real On-Chain (MetaMask Required)
- Leverage Trading, Owner Pool Deposit/Withdraw
- Lending (supply/withdraw/borrow/repay for ALL tokens including CRO)
- Revenue Staking (stake/unstake)
- Predictions, Flash Loans, Insurance, DEX Aggregator
- Copy Trading, Limit Orders, Perpetual DEX, OTC Trading
- DAO Governance (propose/vote), Bonds
- Daily Check-in, Squad Create/Join, Trading Competitions
- All Fee Collections, Revenue Seed Fund

## Wallet Balance Labels (IN PROGRESS from previous session)
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
