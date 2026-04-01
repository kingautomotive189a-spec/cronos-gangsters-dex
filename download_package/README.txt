===============================================
CRONOS GANGSTERS - COMPLETE PACKAGE
===============================================
Date: April 1, 2026
Version: FINAL - All features included

===============================================
WHAT'S INCLUDED
===============================================

/backend/
  telegram_bot.py    - Telegram bot (28 commands + security)
  server.py          - Dashboard API server
  .env               - Configuration (bot token, contracts, etc.)
  requirements.txt   - Python dependencies

/frontend/
  App.js             - React dashboard
  App.css            - Dashboard styles
  .env               - Frontend config

/website/
  cronos-gangsters-full.html      - Complete website (28MB)
  cronos-gangsters-no-banners.html - Website with deploy banners removed

===============================================
TELEGRAM BOT COMMANDS (28 TOTAL)
===============================================

GENERAL COMMANDS (22):
  /start        - Welcome message
  /help         - Show all commands
  /price        - $GANG price & stats
  /stats        - Detailed statistics
  /contract     - Contract address
  /alert        - Set price alerts
  /buy          - How to buy $GANG
  /website      - DEX website link
  /socials      - Social media links
  /shill        - Shareable promo message
  /farms        - Yield farms & APRs
  /vaults       - Auto-compound vaults
  /staking      - Staking vault info
  /launchpad    - IDO launchpad
  /locker       - LP token locker
  /lottery      - Play the lottery
  /sniper       - Sniper bot info
  /bridge       - Cross-chain bridge
  /create       - Token creator
  /marketplace  - NFT marketplace
  /nft          - NFT collection
  /referral     - Referral program (5%)

ADMIN COMMANDS (6):
  /ban          - Ban user
  /unban        - Unban by ID
  /mute         - Mute user
  /unmute       - Unmute user
  /kick         - Kick from group
  /warn         - Warn (3 = ban)

SECURITY FEATURES (4):
  - Human verification (math captcha for new members)
  - Anti-scam filter (detects scam patterns)
  - Auto-ban scammers (2 warnings = ban)
  - Link whitelist (only trusted domains)

===============================================
CONFIGURATION
===============================================

Bot Token:     8760734535:AAFvtYmVE5FRFeLS8y6_ixT_2bm_YInKH8k
Contract:      0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF
Group ID:      -1003284963991
Website:       https://cronosgangsters.com
Twitter:       https://x.com/CronosGangstersDEX
Telegram:      https://t.me/+DrWDScTEiLg1ZGQ0

CONTRACT ADDRESSES:
  GANG Token:    0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF
  MasterChef:    0x3713567b8DB60D7127B2614965eef71cE50871Ea
  Staking:       0x03c3C706F0D2F4754755988A686a70E661e6925F
  Referral:      0xd4791929e86EFE7D770b64B6dEC021dE28E8773a
  NFT:           0x97489dc06aA00b62B52D7eB6E5b51E8c3dd36431
  Treasury:      0xaA3C5749628610fF410EF9133a4ac4f58e9A52eA

===============================================
HOW TO RUN THE BOT
===============================================

1. Install Python 3.9+
2. cd backend
3. pip install -r requirements.txt
4. Edit .env with your settings
5. python telegram_bot.py

===============================================
HOW TO RUN THE DASHBOARD
===============================================

1. Install Node.js 18+
2. cd frontend
3. npm install (or yarn)
4. npm start

===============================================
DEPLOYED CONTRACTS STATUS
===============================================

Launchpad: ✅ DEPLOYED
Locker:    ✅ DEPLOYED  
Lottery:   ❌ NOT DEPLOYED (waitTxRaw bug - fix needed)

===============================================
GANG OR NOTHING! 🔫
===============================================
