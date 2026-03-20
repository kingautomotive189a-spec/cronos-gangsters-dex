# Cronos Gangsters DEX - Vercel Deployment Guide

## Overview
This is a Web3 DEX application that runs entirely on the client-side. All swap, liquidity, and staking operations interact directly with smart contracts on the Cronos blockchain via VVS Finance Router.

## Prerequisites
- [Vercel Account](https://vercel.com/signup)
- [GitHub Account](https://github.com) (for connecting repo)

## Deployment Steps

### Option 1: Deploy via Vercel CLI

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Navigate to frontend directory**
   ```bash
   cd /app/frontend
   ```

3. **Login to Vercel**
   ```bash
   vercel login
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Option 2: Deploy via Vercel Dashboard

1. **Push code to GitHub**
   - Create a new repository on GitHub
   - Push the `/app/frontend` folder to the repository

2. **Connect to Vercel**
   - Go to [vercel.com/new](https://vercel.com/new)
   - Click "Import Git Repository"
   - Select your GitHub repository

3. **Configure Build Settings**
   - Framework Preset: `Create React App`
   - Build Command: `yarn build` or `craco build`
   - Output Directory: `build`
   - Install Command: `yarn install`

4. **Environment Variables** (Optional)
   - No environment variables needed for core functionality
   - All blockchain operations are client-side

5. **Deploy**
   - Click "Deploy"
   - Wait for build to complete

## Project Structure
```
frontend/
├── public/
│   └── index.html
├── src/
│   ├── App.js              # Main app with routing
│   ├── config/
│   │   └── contracts.js    # VVS Router & token addresses
│   ├── stores/
│   │   └── index.js        # Web3 & state management
│   ├── pages/
│   │   ├── SwapPage.js     # Token swap via VVS
│   │   ├── LiquidityPage.js
│   │   ├── FarmsPage.js
│   │   ├── StakingPage.js
│   │   └── RoadmapPage.js
│   └── components/
│       └── ui/
├── vercel.json             # Vercel configuration
├── package.json
└── craco.config.js
```

## Smart Contract Addresses (Cronos Mainnet)
| Contract | Address |
|----------|---------|
| VVS Router | `0x145863Eb42Cf62847A6Ca784e6416C1682b1b2Ae` |
| VVS Factory | `0x3B44B2a187a7b3824131F8db5a74194D0a42Fc15` |
| WCRO | `0x5C7F8A570d578ED84E63fdFA7b1eE72dEae1AE23` |
| $GANG Token | `0x34be5b8c30ee4fde069dc878989686abe9884470` |

## Features
- ✅ Token Swap (via VVS Finance Router)
- ✅ Add Liquidity
- ✅ LP Farms (UI - staking requires contract)
- ✅ $GANG Staking Vault (UI - staking requires contract)
- ✅ Roadmap
- ✅ Multi-wallet support (MetaMask, Crypto.com, WalletConnect, Coinbase)
- ✅ Import custom tokens

## Custom Domain Setup
1. Go to your Vercel project settings
2. Navigate to "Domains"
3. Add your custom domain (e.g., `cronosgangsters.com`)
4. Update DNS records as instructed

## Troubleshooting

### Build Errors
- Ensure Node.js version is 18+
- Run `yarn install` before building
- Check for TypeScript errors

### Wallet Connection Issues
- Ensure MetaMask is on Cronos network (Chain ID: 25)
- Check RPC URL: `https://evm.cronos.org`

### Swap Not Working
- Verify token allowance is approved
- Check sufficient CRO for gas fees
- Ensure VVS has liquidity for the pair

## Support
- DexScreener: https://dexscreener.com/cronos/0x34be5b8c30ee4fde069dc878989686abe9884470
- Cronos Explorer: https://explorer.cronos.org
- VVS Finance: https://vvs.finance
