# Cronos Gangsters Telegram Bot PRD

## Original Problem Statement
Fix Telegram bot for Cronos Gangsters ($GANG token on Cronos blockchain). Ensure all features work including price popup, buy/chart buttons, welcome messages, auto price updates, and moderation features.

## Project Overview
A comprehensive Telegram bot dashboard for the Cronos Gangsters project, providing:
- Real-time $GANG token price tracking via Dexscreener API
- Telegram bot with full command suite
- Admin moderation capabilities
- Web dashboard for monitoring and control

## User Personas
1. **Token Holders** - Need quick access to price, buy links, and contract info
2. **Community Members** - Interact with bot in Telegram groups
3. **Group Admins** - Need moderation tools (ban, mute, warn)
4. **Project Owners** - Monitor bot status and control via dashboard

## Core Requirements (Static)
- [x] Price fetching from Dexscreener API
- [x] Telegram bot with commands
- [x] Auto price updates to group (every 5 mins)
- [x] Welcome new members
- [x] Admin moderation commands
- [x] Price alerts
- [x] Web dashboard

## What's Been Implemented (Jan 2026)

### Telegram Bot Features
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

### Admin Commands
| Command | Description | Status |
|---------|-------------|--------|
| /ban | Ban user (reply to message) | ✅ |
| /unban | Unban user by ID | ✅ |
| /mute | Mute user | ✅ |
| /unmute | Unmute user | ✅ |
| /kick | Kick user | ✅ |
| /warn | Warn user (3 strikes = ban) | ✅ |

### Web Dashboard Features
- Real-time price display with 1H/6H/24H changes
- Market data: Volume, Liquidity, Market Cap, Transactions
- Contract address with copy button
- Bot control panel (Start/Stop)
- Command reference documentation
- Quick links to DEX, Twitter, Telegram, Chart

### Backend APIs
- `GET /api/token/price` - Fetch token price from Dexscreener
- `GET /api/bot/config` - Get bot configuration
- `GET /api/bot/status` - Check if bot is running
- `POST /api/bot/start` - Start bot
- `POST /api/bot/stop` - Stop bot
- `GET /api/bot/commands` - List all commands

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

### P1 (High) - Future
- [ ] Price history chart in dashboard
- [ ] Multiple token support
- [ ] Wallet integration for instant buys
- [ ] Advanced analytics

### P2 (Medium) - Future
- [ ] Custom welcome message editor
- [ ] Scheduled announcements
- [ ] Trading volume alerts
- [ ] Anti-spam auto-moderation

### P3 (Low) - Future
- [ ] Multi-language support
- [ ] Custom branding options
- [ ] API rate limit monitoring

## Next Tasks
1. Monitor bot performance in production
2. Add price history tracking and charts
3. Implement wallet connection for dashboard
