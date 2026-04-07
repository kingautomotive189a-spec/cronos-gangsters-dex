# Cronos Gangsters DApp — Product Requirements

## Problem Statement
Web3 DeFi DApp on Cronos blockchain. Single-file HTML deployment (~28K lines).

## Architecture
- Single file: `/app/frontend/public/cronos-gangsters.html`
- Delivery: `/app/frontend/public/cronos-gangsters-deploy.zip`
- Stack: Vanilla HTML/JS, Ethers.js v6, no framework, 100% on-chain

## Completed Features
- Trading 212 style Leverage Trading UI (100x, 69 pairs)
- Trading 212 style asset cards (pure black, emojis, bigger logos)
- Chart position entry lines (anchored to current price level, PnL badge, liquidation line)
- Arsenal + Owner Pool Controls in collapsible bars
- Homepage layout: Leverage showcase (live prices) → gangster cards → earn → swap
- On-chain LP liquidity reader (12 VVS pools)
- Clear History fix (only clears closed trades)
- **CRITICAL FIX**: Orphaned `</div>` closing `page-futures` prematurely — fixed, leverage now ONLY on homepage + leverage page
- **CRITICAL FIX**: `showPage()` now sets inline `display:none/block` for Crypto.com wallet browser
- Mobile contrast fixes, horizontal scroll lock, futuresBottomNav overlay fix

## Key Rules
- NEVER break into multiple files
- Small search_replace chunks only
- Do NOT touch wallet logic (sendTransaction, signer, MetaMask)
- Always generate ZIP after changes
- ALWAYS verify div nesting with python depth counter after editing page-futures
- Wallet code verified intact: doSwap, openFuturesPosition, showTradeConfirm, executeTradeConfirm, getTradingVaultAddr (0x68B1837b...)

## Completed (Latest — Apr 7 2026)
- Liquidity page: collapsible "ADD / REMOVE LIQUIDITY" and "YOUR POSITIONS & TOP POOLS" sections using `<details>`/`<summary>` tags, default collapsed, styled with teal/gold aesthetics matching the Arsenal pattern
- **PERFORMANCE FIX**: Parallelized ALL balance reads in `loadBalances()` — token balances, LP balances, and factory lookups now use `Promise.all` instead of sequential loops (was ~25 sequential RPC calls, now fires all at once)
- Added `quickRefreshBalances()` function for instant targeted balance updates after swaps, add/remove liquidity, and leverage trades — only re-reads the 2 affected tokens instead of waiting for the full 15+ token refresh
- **CRITICAL FIX — GANG WITHDRAWAL**: Upgraded Trading Vault contract to support ERC-20 token withdrawals via `withdrawTokenTo(token, to, amount)`. Old vault was CRO-only — GANG went in but never came out. Now closing a GANG leverage position calls `vaultContract.withdrawTokenTo(GANG_ADDR, userAddr, payoutWei)` to actually return GANG to the user's wallet.
- **CRITICAL FIX — INCONSISTENT STATS**: Fixed homepage showing random/different liquidity values every page load. Root cause: 3 competing sources (DexScreener, on-chain LP reader, vault fallback) were racing to overwrite `statTVL`. Now on-chain LP reader is the single authoritative source. Also removed fake $71K volume (was showing accumulated LIFETIME localStorage trades, not real 24h volume). Now only shows real DexScreener 24h volume.
- **CHART LINE FIX**: Adjusted TradingView entry price line Y-position anchor from 50% to 45% chart area and widened the scale for better price-line alignment.
- ZIP regenerated

## Upcoming (P1)
- UI polish remaining pages to match dark Trading 212 aesthetic
- CEX listings
- Multi-chain expansion

## Backlog (P2)
- Mobile App
