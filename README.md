# StockSync v2 — Inventory Tracker
No Firebase. No billing. Works out of the box.

## Run locally

```bash
npm install
npm run dev
# Open http://localhost:5173
```

## Login PINs
| Role  | PIN  |
|-------|------|
| Admin | 1234 |
| Staff | 0000 |

To change PINs: edit line 3 in `src/App.jsx`
```js
const PINS = { admin: '1234', staff: '0000' };
```

## Deploy to Vercel (free)
1. Push this folder to GitHub
2. Go to vercel.com → New Project → Import repo
3. Click Deploy

## Important note
Data is stored in the browser's localStorage.
- ✅ Persists across refreshes and browser restarts
- ✅ Works perfectly on one shared device
- ⚠️ Data is per-browser — different devices won't sync

## Features
- Admin + Staff PIN login
- Add products (Admin only)
- Partial deliveries with quick buttons (+5, +10, +25, +50, +100)
- Live dashboard: Ordered / Delivered / Pending / Progress
- Filter: All / Pending / Completed
- Activity log with timestamps
- Mobile friendly
