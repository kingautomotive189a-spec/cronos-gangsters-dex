# Cronos Gangsters DEX - Product Requirements Document

## Project Overview
Full-featured DeFi DEX platform built on Cronos blockchain for trading $GANG token and other tokens, with VVS Finance Router integration.

## Original Problem Statement
Rebuild a full Cronos Gangsters DEX with:
- Token Swap functionality via VVS Finance Router (real blockchain integration)
- Add Liquidity functionality
- LP Farms with yield farming
- $GANG Staking Vault with tiered lock periods
- Multiple wallet support (MetaMask, Crypto.com, WalletConnect, Coinbase)
- Import custom tokens feature
- Roadmap page
- Proper token logos throughout

## Architecture

### Tech Stack
- **Frontend**: React.js with Zustand state management, Tailwind CSS, ethers.js
- **Backend**: FastAPI (Python) - for supplementary data
- **Blockchain**: Cronos Chain (Chain ID: 25)
- **DEX Router**: VVS Finance Router (0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae)
- **UI Libraries**: Phosphor Icons, Framer Motion

### Key Features Implemented

#### 1. Token Swap (VVS Finance Integration)
- [x] Real VVS Finance Router integration for swaps
- [x] Token selection modal with 8 tokens (CRO, WCRO, GANG, USDC, USDT, WETH, WBTC, VVS)
- [x] Import custom tokens by contract address
- [x] Real-time swap quotes from blockchain
- [x] Slippage tolerance settings (0.1%, 0.5%, 1.0%, custom)
- [x] Token approval flow
- [x] Quick actions (Buy/Sell $GANG)

#### 2. Add Liquidity
- [x] Two-token liquidity provision
- [x] Pool information display (reserves, price, total supply)
- [x] New pool detection
- [x] Impermanent loss warning
- [x] How It Works guide

#### 3. LP Farms
- [x] 4 farming pools: GANG/CRO (245.5% APR), GANG/USDC (180.2%), CRO/USDC (45.8%), ETH/CRO (65.3%)
- [x] Token pair logos
- [x] TVL tracking ($216,150 total)
- [x] Multiplier badges (10x, 8x, 3x, 2x)
- [x] Stake LP and Harvest buttons

#### 4. $GANG Staking Vault
- [x] 6 lock period tiers: 6mo (45%), 12mo (80%), 18mo (110%), 24mo (150%), 36mo (210%), 48mo (300% MAX)
- [x] Multiplier system (1x to MAX)
- [x] Estimated rewards calculator
- [x] Early exit penalty warning (25%)
- [x] Your Stakes and Claimable Rewards sections

#### 5. Wallet Integration (Real Blockchain)
- [x] MetaMask support
- [x] Crypto.com DeFi Wallet support
- [x] WalletConnect support
- [x] Coinbase Wallet support
- [x] Auto-switch to Cronos chain
- [x] Real balance fetching from blockchain
- [x] Account change listeners

#### 6. Roadmap Page
- [x] 4 phases with timeline visualization
- [x] Phase 1: The Foundation (Q1 2024) - Completed
- [x] Phase 2: The Expansion (Q2 2024) - In Progress
- [x] Phase 3: The Domination (Q3 2024) - Upcoming
- [x] Phase 4: The Legacy (Q4 2024) - Upcoming
- [x] Progress bars and status badges
- [x] Ultimate Vision section
- [x] Call-to-action buttons

### Token Information
- **$GANG**: Cronos Gangsta token
  - Contract: 0x34be5b8c30ee4fde069dc878989686abe9884470
  - Price: ~$0.00001306 USD
  - Market Cap: $13,000
  - Liquidity: $1,300

### Contract Addresses
- VVS Router: 0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae
- VVS Factory: 0x3B44B2a187a7b3824131F8db5a74194D0a42Fc15
- WCRO: 0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23
- GANG: 0x34be5b8c30ee4fde069dc878989686abe9884470

## Design System
- **Theme**: Dark gangster aesthetic
- **Primary Color**: Gold (#D4A017)
- **Background**: Deep black (#0f0f10, #151515)
- **Success**: Green (#27AE60)
- **Danger**: Red (#E74C3C)
- **Font**: Bebas Neue (headings), IBM Plex Mono (body)

## Pages
1. Swap - Token exchange via VVS Router
2. Liquidity - Add/remove liquidity
3. Farms - LP staking for rewards
4. Staking - $GANG vault with lock periods
5. Roadmap - Project development timeline

## Testing Results
- All 5 pages functional
- Wallet connection modal with 4 options
- Token logos displaying properly
- VVS Finance Router integration working
- Real blockchain balance fetching

## Backlog / Future Enhancements
- P0: Remove liquidity functionality
- P1: Claim rewards from staking/farms
- P1: Transaction history page
- P2: Portfolio analytics
- P2: Limit orders
- P3: NFT collection integration

## Date
Updated: March 20, 2026
