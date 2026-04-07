# Cronos Gangsters DApp — Product Requirements

## Problem Statement
Web3 DeFi DApp on Cronos blockchain. Single-file HTML deployment (~28K lines).

## Architecture
- **Single file**: `/app/frontend/public/cronos-gangsters.html`
- **Delivery**: `/app/frontend/public/cronos-gangsters-deploy.zip`
- **Stack**: Vanilla HTML/JS, Ethers.js v6, no framework
- **Data**: 100% on-chain (no database)

## Completed Features
- Trading 212 style Leverage Trading UI (100x, 69 pairs)
- Trading 212 style asset cards (pure black, emojis, bigger logos, change arrows)
- Chart position entry lines (green LONG / red SHORT dashed lines at entry price, PnL badge, liquidation line)
- Arsenal + Owner Pool Controls in collapsible bars
- Global header isolation (homepage only)
- Mobile CSS contrast fixes (Crypto.com wallet browser)
- `futuresBottomNav` overlay fix (`top:auto`)
- Horizontal scroll lock
- Homepage: Leverage showcase (live prices) → gangster cards → earn → swap
- Live price grid on homepage (12 assets, 2s refresh)
- On-chain LP liquidity reader (12 VVS pools, ~$1.6K total)
- Clear History fix (only clears closed trades)
- **CRITICAL FIX: Orphaned `</div>` tag** at line 4967 was prematurely closing `page-futures`, causing chart, trade panel, positions, history, and bottom nav to leak onto ALL pages. Removed the orphan div — leverage now ONLY shows on homepage + leverage page.
- Inline `style.display` enforcement in `showPage()` for Crypto.com wallet browser compatibility

## Key Technical Notes
- NEVER break into multiple files
- Small search_replace chunks
- Do NOT touch wallet logic
- Always generate ZIP after changes
- **ALWAYS verify div nesting** when editing page-futures — use python script to count depth
- `showPage()` now sets `style.display = 'none'/'block'` inline (not just CSS class) for mobile browser compatibility

## Upcoming Tasks (P1)
- Continue UI polish across other pages
- CEX listings feature
- Multi-chain expansion

## Backlog (P2)
- Mobile App
