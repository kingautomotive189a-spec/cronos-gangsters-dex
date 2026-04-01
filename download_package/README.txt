CRONOS GANGSTERS - TELEGRAM BOT PACKAGE
=======================================

FILES INCLUDED:
---------------

/backend/
  - telegram_bot.py    : Main Telegram bot (28 commands + security)
  - server.py          : FastAPI backend for dashboard
  - .env               : Environment configuration
  - requirements.txt   : Python dependencies

/frontend/
  - App.js             : React dashboard
  - App.css            : Dashboard styles

cronos-gangsters-full.html : Complete website file (28MB)


TELEGRAM BOT COMMANDS (28 total):
---------------------------------
General (22): /start, /help, /price, /stats, /contract, /alert, /buy, 
              /website, /socials, /shill, /farms, /vaults, /staking,
              /launchpad, /locker, /lottery, /sniper, /bridge, /create,
              /marketplace, /nft, /referral

Admin (6):   /ban, /unban, /mute, /unmute, /kick, /warn

Security:    Human verification (captcha), Anti-scam filter, 
             Auto-ban scammers, Link whitelist


CONFIGURATION (.env):
---------------------
TELEGRAM_BOT_TOKEN=your_bot_token
CONTRACT_ADDRESS=0x4cE15b52a34dE6F62448fDBAdDF1dB4811DDC3EF
GROUP_ID=-1003284963991
DEX_LINK=https://cronosgangsters.com
TWITTER=https://x.com/CronosGangstersDEX
TELEGRAM_GROUP=https://t.me/+DrWDScTEiLg1ZGQ0
PRICE_UPDATE_INTERVAL=300
ADMIN_IDS=your_telegram_user_id


TO RUN THE BOT:
---------------
1. Install Python 3.9+
2. pip install -r requirements.txt
3. Set your TELEGRAM_BOT_TOKEN in .env
4. python telegram_bot.py


GANG OR NOTHING! 🔫
