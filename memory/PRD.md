# Cronos Gangsters DApp — Product Requirements

## Problem Statement
Web3 DeFi DApp on Cronos blockchain. Single-file HTML deployment (~28K lines) for GoDaddy hosting. Real on-chain smart contract interactions via Trading Vault, VVS Finance LP pools, and custom contracts.

## Architecture
- **Single file**: `/app/frontend/public/cronos-gangsters.html`
- **Delivery**: `/app/frontend/public/cronos-gangsters-deploy.zip`
- **Stack**: Vanilla HTML/JS, Ethers.js v6, no framework
- **Data**: 100% on-chain (no database)
- **APIs**: Binance WebSocket, CoinGecko, DexScreener (all free/no key)

## Completed Features
- Trading 212 style Leverage Trading UI (100x, 69 pairs)
- Arsenal (32 features) in collapsible `<details>` bar
- Owner Pool Controls (8 features) in collapsible `<details>` bar
- Global header isolation (stats bar, contract address, war room images only on homepage)
- Mobile CSS contrast fixes for leverage trading page
- 70+ asset pills on homepage leverage showcase
- Aggressive cache-busting meta tags
- **On-chain LP liquidity reader** — reads ALL 12 VVS LP pools (CRO/GANG, USDC/GANG, WBTC/GANG, WETH/GANG, USDT/GANG, ATOM/GANG, VVS/GANG, etc.) with dynamic token detection and fallback pricing. Displays real total liquidity (~$1.6K) and derives GANG price (~$0.0078) from CRO/GANG pool.
- DexScreener chart iframe pointed to CRO/GANG LP pair (most liquid)

## Key Technical Notes
- **NEVER break into multiple files** — single HTML only
- **Small search_replace chunks** — max 50-100 lines per edit
- **Do NOT touch wallet logic** — `state.signer.sendTransaction` and MetaMask callbacks are verified working
- **Always generate ZIP** after changes
- **On-chain LP reader** uses sequential RPC calls (not parallel) to avoid Cronos RPC rate limits
- **Dynamic token detection**: reads `token0()` and `token1()` from each LP, matches against TOKENS registry by address, reads decimals from chain if unknown

## Upcoming Tasks (P1)
- Revamp rest of UI to match Trading 212 / Fulcrom Finance modern styling
- CEX listings feature
- Multi-chain expansion

## Backlog (P2)
- Mobile App
