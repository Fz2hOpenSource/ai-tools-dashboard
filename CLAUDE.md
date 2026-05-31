# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Common Commands

```bash
npm run dev           # Start dev server (webpack mode, port 3000)
npm run build         # Production build (Turbopack + type check)
npm start             # Start production server
npm run lint          # Run ESLint
```

Building with Turbopack catches type errors that webpack dev mode may miss. Always run `npm run build` before committing.

## Architecture

### Data flow

Browser → SWR polling → API routes (17 total, all `force-dynamic`) → readers layer → filesystem (`~/.claude/`, `~/.openclaw/`, `~/.codex/`). No database. All data is parsed from JSONL/JSON files on disk on every cache-miss request.

### Reader abstraction (`lib/readers/`)

Three providers implement a common interface:
- **Claude Code** (`lib/claude-reader.ts`): reads `~/.claude/projects/<slug>/*.jsonl` and `usage-data/session-meta/*.json`. Has per-file mtime cache.
- **OpenClaw** (`lib/readers/openclaw.ts`): reads `agents/main/sessions/<id>.jsonl`, parses `type: "session"|"message"|"model_change"` events
- **Codex** (`lib/readers/codex.ts`): reads `sessions/YYYY/MM/DD/rollout-*.jsonl`, parses `$rollout_item_type` events

All readers return `ParsedSession[]` (extends `SessionMeta`, defined in `lib/claude-reader.ts`, not in `types/claude.ts`). The `_provider` field tags each session's origin.

### Cache layers

Three-tier cache in `lib/claude-reader.ts:getAllParsedSessions()`:
1. **Memory** (5-min TTL): instant. Normal page nav hits this.
2. **Disk** (`%TEMP%/cc-lens-sessions-cache.json`): survives restarts, loaded only on first call after startup.
3. **Source files**: 8s cold parse of 165+ JSONL files. Only on first install or manual Refresh.

Request dedup: `_allSessionsPromise` ensures concurrent API calls share one parse pass.

### i18n (`lib/i18n.tsx`)

Lightweight React Context, no third-party lib. `useI18n()` returns `{ t, locale, setLocale }`. 200+ keys in `DICT`. Pages use `t('key')` for user-visible strings. Data content (project names, session IDs) is never translated. Language persists in localStorage, defaults to browser detection.

### Styling

Tailwind CSS v4 with `@theme inline` for custom variables. "Terminal Observatory" theme: deep blue-black backgrounds (`#080b11`), amber/orange accents (`#e0780a`). CRT noise SVG overlay on body. Custom keyframes: `fade-in-up`, `pulse-glow`, `shimmer`, `scan-line`. All card hover effects use `::after` pseudo-elements with gradient overlays. Chart overrides in `.recharts-*` classes.

## Key Patterns

### Pages are all client components

Every page uses `'use client'` + SWR for data fetching. No React Server Components are used for data loading — the app reads local filesystem, which requires server-side API routes. API routes use `export const dynamic = 'force-dynamic'` to prevent Next.js caching.

### SWR polling intervals vary by page

- 5s: Projects, Tools, Activity (more dynamic)
- 10s: Todos
- 15s: Memory
- 30s: Overview, Sessions, Costs, History, Plans, Settings, Export

The `mutate(() => true)` pattern in TopBar Refresh triggers global revalidation.

### Adding a new page

1. Create `app/<route>/page.tsx` with `'use client'` + `TopBar` + SWR
2. Create API route in `app/api/<route>/route.ts` if new data needed
3. Add nav entry in `sidebar.tsx:NAV_KEYS` with i18n key
4. Add translations in `lib/i18n.tsx` under both `en` and `zh-CN`

### Adding a new provider

1. Implement `ProviderReader` interface from `lib/readers/types.ts`
2. Add to `EXTERNAL_READERS` array in `lib/readers/index.ts`
3. Provider is auto-detected by checking if its data directory exists
4. Sessions are auto-merged via `getExternalSessions()` in `getAllParsedSessions()`

### JSX must use `.tsx` extension

`.ts` files cannot contain JSX (Turbopack build will fail). Both `lib/toast.tsx` and `lib/i18n.tsx` were renamed from `.ts` for this reason.

### TopBar title translation

Pass `titleKey` instead of `title` for auto-translation. `titleKey` uses the i18n dictionary; `title` is a raw string. Both are optional — if neither is provided, displays empty string.
