# Cronos Gangsters Telegram Bot PRD

## Original Problem Statement
Fix Telegram bot for Cronos Gangsters ($GANG token on Cronos blockchain). Ensure all features match the website cronosgangsters.com including:
- All DeFi features (farms, vaults, staking, launchpad, locker, lottery, sniper, bridge, token creator, marketplace)
- Human verification for new members
- Anti-scam protection
- Admin moderation tools

## What's Been Implemented (Jan 2026)

### Bot Commands (28 total)

#### General Commands (22)
| Command | Description |
|---------|-------------|
| /start | Welcome message & info |
| /help | Show all commands |
| /price | Current $GANG price & stats |
| /stats | Detailed token statistics |
| /contract | Token contract address |
| /alert | Set price alerts |
| /buy | How to buy $GANG |
| /website | DEX website link |
| /socials | Social media links |
| /shill | Shareable promo message |
| /farms | Yield farms & APRs |
| /vaults | Auto-compound vaults |
| /staking | Staking vault info |
| /launchpad | IDO launchpad |
| /locker | LP token locker |
| /lottery | Play the lottery |
| /sniper | Sniper bot info |
| /bridge | Cross-chain bridge |
| /create | Token creator |
| /marketplace | NFT marketplace |
| /nft | NFT collection info |
| /referral | Referral program |

#### Admin Commands (6)
| Command | Description |
|---------|-------------|
| /ban | Ban a user |
| /unban | Unban by ID |
| /mute | Mute a user |
| /unmute | Unmute a user |
| /warn | Warn user (3 = ban) |
| /kick | Kick from group |

### Security Features (NEW)
1. **Human Verification** - Math captcha for new members (2 min timeout)
2. **Anti-Scam Filter** - Detects scam patterns & suspicious links
3. **Auto-Ban** - 2 warnings = automatic ban
4. **Link Whitelist** - Only trusted domains allowed (cronosgangsters.com, t.me, dexscreener.com, etc.)

### Auto Features
- Auto price updates every 5 minutes to group
- Auto-kick users who fail verification
- Auto-delete scam messages
- Auto-warn for suspicious links

### Contract Addresses (from website)
- GANG: `0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF`
- MasterChef: `0x3713567b8DB60D7127B2614965eef71cE50871Ea`
- Staking: `0x03c3C706F0D2F4754755988A686a70E661e6925F`
- Referral: `0xd4791929e86EFE7D770b64B6dEC021dE28E8773a`
- NFT: `0x97489dc06aA00b62B52D7eB6E5b51E8c3dd36431`
- Treasury: `0xaA3C5749628610fF410EF9133a4ac4f58e9A52eA`

## Web Dashboard
Running at: https://tg-all-in-one.preview.emergentagent.com

Features:
- Live $GANG price display
- Bot control (Start/Stop)
- All 28 commands listed
- Security features display
- Quick links to website, chart, socials

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
- Backend: Python FastAPI
- Bot: python-telegram-bot v22.7
- Frontend: React
- Price Data: Dexscreener API
- Database: MongoDB

## Files
- `/app/backend/telegram_bot.py` - Main bot code
- `/app/backend/server.py` - API server
- `/app/frontend/src/App.js` - Dashboard

## Next Tasks
- Deploy dashboard to permanent hosting
- Add your Telegram user ID to ADMIN_IDS for admin commands
- Monitor bot in production
