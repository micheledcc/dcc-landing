# design-sync notes — dcc-landing

- The landing page itself is NOT componentized in the app: `app/page.tsx` renders one inline-styled HTML string from `app/_landing-content.ts`. The design system was extracted from that markup into `ds/` (2026-08-06) — `ds/src` is the source of truth for the DS; if the landing page's design changes, `ds/` must be updated by hand to match.
- `ds/` builds with `npx tsc -p ds/tsconfig.json` (repo root). Output `ds/dist` (ESM + .d.ts). The converter runs with `--entry ./ds/dist/index.js --node-modules ./node_modules`.
- `cfg.cssEntry` is package-relative (`src/styles/dcc.css`), not repo-relative — a repo-relative path is silently skipped with `! cssEntry: … not found`.
- The app's own `DataTable` (`app/components/data-table.tsx`) uses Tailwind classes; the DS copy (`ds/src/components/DataTable.tsx`) is the same logic ported to inline styles so the package needs no Tailwind build. Keep them in sync if the app table changes.
- Fonts are remote (Google Fonts `@import` in `dcc.css`) → `[FONT_REMOTE]` is expected, not a warn to chase.
- No provider needed — all components are self-styled inline; hover states live in `dcc.css` (`.dcc-btn-*`, `.dcc-nav-link`, `.dcc-table-row`, `.dcc-sort-btn`, `.dcc-resize-handle`).
- Full-width components carry `cardMode: "column"` overrides in config (DataTable, SiteHeader, SiteFooter, ProcessTimeline, FeatureCardGrid, DarkStatement, ContactSplit).
- Grade JSON gotcha: writing grade files from a zsh loop mangled multi-cell keys (zsh doesn't word-split unquoted vars). Write grade files with a proper JSON writer.
- Playwright chromium cache lives at `~/Library/Caches/ms-playwright/` (macOS), build chromium-1234, playwright installed in `.ds-sync/node_modules`.

## Known render warns

- (none — final validate was clean; 14/14 render, 0 bad/thin)

## Re-sync risks

- The DS duplicates styles from `app/_landing-content.ts` by hand — landing-page edits do NOT propagate automatically; diff the page against `ds/src` when the site changes.
- Preview copy inlines landing-page text; if positioning/copy changes materially, previews still render but read stale.
- Google Fonts loaded at runtime — offline render checks would show fallback fonts; network needed for faithful screenshots.
- `ds/` is not consumed by the Next.js app anywhere — nothing in CI builds it, so `ds/dist` can silently go stale; always run `cfg.buildCmd` before the converter.
