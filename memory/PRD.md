# Cronos Gangsters DEX - Product Requirements Document

## Project Overview
Full-featured DeFi DEX platform built on Cronos blockchain for trading $GANG token and other tokens.

## Original Problem Statement
Rebuild a full Cronos Gangsters DEX with:
- Token Swap functionality for $GANG and other tokens
- LP Farms with yield farming
- $GANG Staking Vault with tiered lock periods
- Wallet connection functionality
- Working swap for all tokens

## Architecture

### Tech Stack
- **Frontend**: React.js with Zustand state management, Tailwind CSS, Recharts
- **Backend**: FastAPI (Python)
- **Database**: MongoDB
- **UI Libraries**: Phosphor Icons, Framer Motion

### Key Features Implemented

#### 1. Token Swap (Core Feature)
- [x] Token selection modal with 6 tokens (GANG, WCRO, USDC, USDT, WETH, WBTC)
- [x] Real-time swap quotes with rate, price impact, fees
- [x] Execute swap with balance updates
- [x] Swap direction toggle
- [x] Quick actions (Buy/Sell $GANG)
- [x] 24h price chart with tooltip
- [x] Recent swap history

#### 2. LP Farms
- [x] 4 farming pools: GANG/CRO, GANG/USDC, CRO/USDC, ETH/CRO
- [x] APR display (45.8% - 245.5%)
- [x] TVL tracking
- [x] Deposit LP tokens
- [x] Harvest rewards (UI ready)

#### 3. $GANG Staking Vault
- [x] 6 lock period tiers: 6mo (45%), 12mo (80%), 18mo (110%), 24mo (150%), 36mo (210%), 48mo (300%)
- [x] Multiplier system (1x to MAX)
- [x] Stake $GANG tokens
- [x] View active positions
- [x] Claimable rewards display
- [x] Early withdrawal penalty warning (25%)

#### 4. Wallet Integration
- [x] Simulated wallet connection
- [x] Balance tracking per token
- [x] Transaction history

### Token Information
- **$GANG**: Cronos Gangsta token
  - Price: ~$0.00001306 USD
  - Market Cap: $13,000
  - Liquidity: $1,300

## API Endpoints
- GET /api/tokens - List all tokens
- POST /api/swap/quote - Get swap quote
- POST /api/swap/execute - Execute swap
- GET /api/farms - List farming pools
- POST /api/farms/deposit - Deposit LP tokens
- GET /api/staking/tiers - Get staking tiers
- POST /api/staking/stake - Create stake
- GET /api/staking/positions/{wallet} - Get user stakes
- GET /api/wallet/balances/{wallet} - Get wallet balances
- GET /api/dex/stats - Get DEX statistics
- GET /api/price-history/{token} - Get price history

## Design System
- **Theme**: Dark gangster aesthetic
- **Primary Color**: Gold (#D4A017)
- **Background**: Deep black (#0f0f10, #151515)
- **Success**: Green (#27AE60)
- **Danger**: Red (#E74C3C)
- **Font**: Bebas Neue (headings), IBM Plex Mono (body)

## Testing Results
- Backend: 100% (18/18 endpoints working)
- Frontend: 95% (minor chart warnings only)

## What's Mocked/Simulated
- Wallet connection generates random address
- Token balances stored in MongoDB (not blockchain)
- Swaps recorded in database (not real transactions)
- Prices are static (not live feeds)

## Backlog / Future Enhancements
- P0: Real blockchain integration with Web3/ethers.js
- P1: Live price feeds from CoinGecko/DexScreener
- P1: Claim rewards functionality
- P2: Withdraw/unstake functionality  
- P2: Add more token pairs
- P3: Portfolio analytics page
- P3: Limit orders

## Date
Created: March 20, 2026
