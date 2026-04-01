# Cronos Gangsters — Product Requirements Document

## Original Problem Statement
Build a Telegram Bot for the Cronos Gangsters Web3 DEX with ALL website features. Optimize DApp loading speed. Merge all features from previous builds. Add Mining, Trading, and Deploy pages. Owner revenue collection banners on all fee-generating features.

## All Pages
| Page | URL | Description |
|------|-----|-------------|
| DApp (Main) | `/cronos-gangsters.html` | Full DEX: Swap, Liquidity, Farms, Vaults, Staking, Bridge, etc. |
| Dashboard | `/dashboard.html` | Bot Start/Stop, live $GANG stats, all features, bot commands |
| Mining Hub | `/mining.html` | Tap-to-earn, 10 games, VIP, lottery, staking, tournaments |
| Leverage Trading | `/trading.html` | Trade 8 pairs with up to 100x leverage |
| Deploy Contract | `/deploy.html` | 1-click GANGRewards contract deployment |
| Deploy Farms | `/deploy-farms.html` | Create LP pairs + register on MasterChef |

## Owner Revenue Banners
- **Mining page**: Shows house earnings, total burned, users, jackpot pool + COLLECT button (visible only to owner wallet)
- **Trading page**: Shows total fees earned (0.1% per trade) + COLLECT button (visible only to owner wallet)
- Owner wallet: `0xedb10BeD5b9e0be39FE1CCDd417C20D5c76A8baf`

## Farm Pools (10 total)
| PID | Name | Status |
|-----|------|--------|
| 0-3 | GANG/VVS, CRO/GANG, GANG/USDC, GANG Staking | Active |
| 4-6 | CRO/USDC, CRO/WETH, CRO/VVS | Coming Soon |
| 7-9 | XRP/GANG, PEPE/GANG, DOGE/GANG | Needs LP Deploy |

## Tech Stack
- Frontend: Vanilla JS/Ethers.js v5+v6 (DApp + standalone pages)
- Backend: FastAPI, Python Telegram Bot (v20+)
- Database: MongoDB (mining/trading data)
- Blockchain: Cronos chain (Chain ID 25)
- APIs: CoinGecko, DexScreener, CoinMarketCap, Telegram Bot API

## What's Complete
- Telegram Bot with 28+ commands and callback inline buttons
- Dashboard with live stats, bot control, all commands listed
- DApp speed optimization (images 73% smaller, lazy loading, parallel startup)
- Hash routing for Telegram deep links
- Mining Hub with 10 games, VIP, lottery, staking, tournaments
- Leverage Trading with 8 pairs
- Deploy Contract + Deploy Farms pages
- Owner revenue banners on Mining and Trading pages
- 3 new farm pools (XRP, PEPE, DOGE) with deploy buttons
