# Cronos Gangsters DApp — Product Requirements

## Original Problem Statement
Build a comprehensive Web3 DApp for Cronos blockchain as a single deployable HTML file. All features must use real on-chain smart contracts with MetaMask wallet confirmation for every transaction.

## Architecture
- **Single-file deployment**: `/app/frontend/public/cronos-gangsters.html` (~25k lines)
- **Delivery**: ZIP file at `/app/frontend/public/cronos-gangsters-deploy.zip`
- **Chain**: Cronos Mainnet (chain ID 25)
- **Stack**: Vanilla HTML/CSS/JS, Ethers.js v6, TradingView widgets

## Deployed Smart Contracts
- GANG Token: `0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF`
- Trading Pool: `0xc7002e7c73d4910f0f83a66d187d2be951360619`
- Protocol Vault: `0x7bed7483eeb27c7cd85ba76dfb141290156138ea`

## Leverage Trading — 8 Token Pools (2026-04-06)
**Tokens**: GANG, CRO, BTC, ETH, SOL, BNB, USDC, USDT

Each pool has:
- Token icon (CoinGecko), color-themed card
- Pool Balance + Profit display
- DEPOSIT and WITHDRAW buttons with MetaMask confirmation
- "TRADE WITH" currency selector with all 8 tokens

**Liquidity Protection**:
- Non-GANG pools: Position blocked if pool has 0 liquidity
- Position blocked if pool balance < position size (amount × leverage)
- GANG pool exempt (backed by on-chain Trading Pool contract)
- Trading automatically stops for tokens with no liquidity
- Fee collection routes to correct pool per currency

## All On-Chain Features (MetaMask Required)
- Leverage Trading (8 tokens), Lending, Predictions, Flash Loans
- Insurance, DEX Aggregator, Copy Trading, Revenue Staking
- Limit Orders, Perpetual DEX, OTC Trading, DAO Governance
- Bonds, Daily Check-in, Squads, Trading Competitions
- All Fee Collections, Revenue Seed Fund

## Upcoming Tasks
- P1: Wallet balance labels (Predictions, DAO, Bonds, Flash Loans)
- P1: CEX listings
- P1: Multi-chain expansion
- P2: Mobile App
