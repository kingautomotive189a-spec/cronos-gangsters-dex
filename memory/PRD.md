# Cronos Gangsters Telegram Bot PRD

## Original Problem Statement
Fix Telegram bot for Cronos Gangsters ($GANG token on Cronos blockchain). Ensure all features work including price popup, buy/chart buttons, welcome messages, auto price updates, and moderation features. Match features with cronosgangsters.com website.

## Project Overview
A comprehensive Telegram bot dashboard for the Cronos Gangsters project, providing:
- Real-time $GANG token price tracking via Dexscreener API
- Telegram bot with full command suite
- Admin moderation capabilities
- Web dashboard for monitoring and control
- Integration with cronosgangsters.com features

## User Personas
1. **Token Holders** - Need quick access to price, buy links, and contract info
2. **Community Members** - Interact with bot in Telegram groups
3. **Group Admins** - Need moderation tools (ban, mute, warn)
4. **Project Owners** - Monitor bot status and control via dashboard
5. **Farmers/Stakers** - Need farm APRs and staking info

## Core Requirements (Static)
- [x] Price fetching from Dexscreener API
- [x] Telegram bot with commands
- [x] Auto price updates to group (every 5 mins)
- [x] Welcome new members
- [x] Admin moderation commands
- [x] Price alerts
- [x] Web dashboard
- [x] Farms info with APRs
- [x] Staking vault info
- [x] NFT collection info
- [x] Referral program info

## What's Been Implemented (Jan 2026)

### Telegram Bot Features (20 Commands Total)
| Command | Description | Status |
|---------|-------------|--------|
| /start | Welcome message & project info | ✅ |
| /help | Show all commands | ✅ |
| /price | Current price with full stats | ✅ |
| /stats | Detailed token statistics | ✅ |
| /contract | Token contract address | ✅ |
| /buy | How to buy $GANG | ✅ |
| /website | DEX website link | ✅ |
| /socials | Social media links | ✅ |
| /shill | Shareable promo message | ✅ |
| /alert | Set price alerts | ✅ |
| /farms | View yield farms & APRs | ✅ NEW |
| /staking | Staking vault info & APYs | ✅ NEW |
| /nft | NFT collection info | ✅ NEW |
| /referral | Referral program (5% rewards) | ✅ NEW |

### Admin Commands
| Command | Description | Status |
|---------|-------------|--------|
| /ban | Ban user (reply to message) | ✅ |
| /unban | Unban user by ID | ✅ |
| /mute | Mute user | ✅ |
| /unmute | Unmute user | ✅ |
| /kick | Kick user | ✅ |
| /warn | Warn user (3 strikes = ban) | ✅ |

### Contract Addresses (from cronosgangsters.com)
- GANG Token: `0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF`
- MasterChef: `0x3713567b8DB60D7127B2614965eef71cE50871Ea`
- Staking: `0x03c3C706F0D2F4754755988A686a70E661e6925F`
- Referral: `0xd4791929e86EFE7D770b64B6dEC021dE28E8773a`
- NFT: `0x97489dc06aA00b62B52D7eB6E5b51E8c3dd36431`
- Treasury: `0xaA3C5749628610fF410EF9133a4ac4f58e9A52eA`

### Farm Data (from website)
- GANG/VVS: ~500% APR, 10% allocation
- CRO/GANG: ~500% APR, 40% allocation, $1.3K TVL
- GANG/USDC: ~500% APR, 30% allocation, $201 TVL
- GANG Staking: ~500% APR, 20% allocation

### Staking Tiers (from website)
- 6 Months: 45% APY (1x)
- 1 Year: 80% APY (1.8x)
- 18 Months: 110% APY (2.4x)
- 2 Years: 150% APY (3.3x)
- 3 Years: 210% APY (4.7x)
- 4 Years: 300% APY (MAX)

### NFT Info
- 500 Unique Gangsters
- Mint Price: 50 CRO
- +20% Staking Boost for holders

## Configuration
```
BOT_TOKEN: 8760734535:AAFvtYmVE5FRFeLS8y6_ixT_2bm_YInKH8k
CONTRACT: 0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF
GROUP_ID: -1003284963991
DEX: https://cronosgangsters.com
TWITTER: https://x.com/CronosGangstersDEX
TELEGRAM: https://t.me/+DrWDScTEiLg1ZGQ0
```

## Tech Stack
- **Backend**: Python FastAPI
- **Frontend**: React
- **Bot**: python-telegram-bot v22.7
- **Price Data**: Dexscreener API
- **Database**: MongoDB (for price history)

## Prioritized Backlog

### P0 (Critical) - DONE
- [x] Fix bot connection
- [x] Price popup with stats
- [x] All basic commands
- [x] Farms/Staking/NFT/Referral commands

### P1 (High) - Future
- [ ] Real-time farm APR from on-chain
- [ ] NFT minting via bot
- [ ] Wallet connection for bot

### P2 (Medium) - Future
- [ ] Price history chart
- [ ] Sniper bot integration
- [ ] Trading alerts

## Next Tasks
1. Test all new commands in Telegram
2. Add real-time on-chain data for farms
3. Consider sniper bot integration
