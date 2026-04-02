# Cronos Gangsters — PRD

## Original Problem Statement
Ultra-fast vanilla JS DApp for Cronos Gangsters DEX with Telegram bot, mining/casino games, leverage trading, deploy farms, dashboard, and owner revenue collection.

## Architecture
- Frontend: Vanilla JS/HTML standalone pages in /frontend/public/
- Backend: FastAPI + python-telegram-bot (v20+)
- Database: MongoDB (Motor async driver)
- Blockchain: Cronos mainnet via ethers.js v6 (6.9.0)

## Key Files
- `/frontend/public/cronos-gangsters.html` — Main DApp
- `/frontend/public/mining.html` — Mining Hub + 19 casino games
- `/frontend/public/trading.html` — Leverage trading with TradingView charts
- `/frontend/public/dashboard.html` — Bot control panel
- `/frontend/public/deploy-farms.html` — Farm deployer
- `/frontend/public/deploy.html` — Contract deployer
- `/backend/server.py` — Main FastAPI server
- `/backend/telegram_bot.py` — Telegram bot (refactored, dispatch table)
- `/backend/mining_api.py` — Casino/mining backend
- `/backend/trading_api.py` — Leverage trading backend

## Owner Wallet
`0xaA3C5749628610fF410EF9133a4ac4f58e9A52eA`

## Key Contracts
- GANG Token: `0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF`
- Mining Rewards: `0xBdAaDDb1cd25758aa40F38c273C355cA943e1c8F`
- MasterChef: `0x3713567b8DB60D7127B2614965eef71cE50871Ea` (301M+ GANG)
- Liquidity Lock: `0xfa7f753a1e4ef3f1f3c8438f53855dfb58fde389` (DX.app, expires Mar 2027)

## Farm Allocations (On-Chain — Confirmed)
- CRO/GANG (Pool 0): 250,000 pts = 50%
- All other 12 pools: 20,833 pts each = 4.17% each
- 7 farms + 6 auto-compound vaults = 13 pools total

## Completed Features (All Sessions)
- Image optimization, lazy loading
- Telegram bot — full feature popups, BuyBot alerts, auto-post on start, LP Lock proof
- Mining Hub — 19 games, tap-to-earn, VIP, referrals, lottery, staking, tournaments
- Leverage Trading — 8 pairs, 100x, live TradingView charts
- 3 new farms (XRP/GANG, PEPE/GANG, DOGE/GANG)
- Dashboard — bot start/stop, quickstart guide, full command list
- Deploy Farms + Deploy Contract pages
- Nav bar — wrapped rows, all items visible, header gangster banner
- Farms — single column, sorted by highest APR, rebalance button (owner-only)
- Vault APR calculations from MasterChef on-chain data
- Code quality refactor — telegram_bot.py dispatch table, secrets module, dead code removed
- MasterChef rebalance — 13 pools set to 50%/4.17% split
- Cleanup — removed old debug elements, duplicate HTML files (57MB freed), old zip packages
- Removed deploy banners: deployCorrectVault, regVaultChef, deployLaunchpad, deployLocker, deployLottery, mktDeployPrompt
- Kept all owner fee/revenue panels: vaultRewardPanel, launchpadFeeBanner, lockerFeePanel, fundRewardsSection, lotteryOwnerPanel, nftOwnerSection, mktOwnerSection
- Download package: cronos-gangsters-full-app.zip (updated)

## Session 2 — April 2, 2026
- Verified Ethers.js v6.9.0 (not v5) — confirmed `setMax()` BigInt math (`rawBal - 1n`) is correct
- Verified null-safety for removed rebalancePanel/farmRewardPanel elements  
- Frontend regression sweep: 18/18 tests passed (iteration_3.json)
- No regressions found in DOM structure, hash navigation, farm sorting, vault APR, nav wrapping
- Removed 6 deploy banners (deployCorrectVault, regVaultChef, deployLaunchpad, deployLocker, deployLottery, mktDeployPrompt)
- Kept all owner fee/revenue panels intact
- Fixed vault APR: now uses real on-chain LP reserves instead of fake estimate (no more 99,999%+)
- Fixed swap: prevents selecting same token on both sides (auto-swaps other side)
- Fixed vault withdraw MAX: uses raw BigInt shares to prevent precision overflow causing "Withdraw REVERTED"
- Fixed farm TVL: removed stale `needsChefAdd: true` flags on PEPE/GANG, DOGE/GANG, XRP/GANG (was causing $0 TVL)
- Added `/api/prices` backend proxy for CoinGecko (avoids CORS on production domain)
- Fixed vault TVL display: now shows USD value instead of LP token count
- Fixed vault APR: proper TVL denominator prevents insane 362K% numbers

## Session 3 — April 2, 2026
- Fixed Vault TVL showing "LP" instead of USD — root cause: `calcVaultAPRsOnChain()` not triggered on vault tab, DexScreener TVL only matched farms not vaults
- Added DexScreener liquidity matching for vaults (same logic as farms, no extra RPC)
- Added `fetchAllTokenPrices().then(() => calcVaultAPRsOnChain())` trigger when vaults tab opens
- Removed "LP" fallback from vault TVL template — always shows `$` amounts
- All 6 vaults now show correct USD TVL: GANG/WETH ($5), GANG/WBTC ($55), GANG/ATOM ($2), etc.
- Fixed approval redundancy: all 5 approval paths now check on-chain allowance before prompting wallet
  - `approveLiqToken()`: checks existing allowance, skips approve if sufficient
  - `_updateLiqApproveButtons()`: async on-chain allowance check auto-marks buttons as APPROVED
  - `doRemoveLiquidity()`: checks LP allowance + approves MaxUint256 (was approving exact amount each time)
  - `approveVaultLP()`: checks allowance before sending approve tx
  - `approveGangForStaking()`: checks allowance before sending approve tx

## Backlog
- P2: Add max payout limits for trading
- P3: Fix use-toast.js stale closures (React, low priority)
