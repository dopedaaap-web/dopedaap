# Ekko

Ekko is a deterministic, client-only Next.js (App Router) experience that translates lyric drafts into musical intent using local-only heuristics.

## Local Development

```bash
npm install
npm run dev
```

Open `http://localhost:3000`.

## Phase 2 Notes

- All analysis happens locally in the browser using deterministic rules in `src/core`.
- Draft text is stored only in `localStorage` (`ekko:draft:{sessionId}`), alongside computed results (`ekko:result:{sessionId}`) and reflection answers (`ekko:reflect:{sessionId}`).
- No external requests, auth, or server-side actions are used.
