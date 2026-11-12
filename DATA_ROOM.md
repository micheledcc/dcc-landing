# Investor data-room connection

The user approved the displayed manifest by continuing on November 12, 2026.
All 13 folder/reference metadata operations, Finder section choices and 53 Notion
labels are complete, preserving all folder/reference IDs and editions. Deployment
uses the existing GitHub → Vercel integration for project dcc21/dcc-landing. Check
the DCC Cloud refresh status for its verified deployment outcome.

`lib/data-room-config.ts` supplies the server-only default from
`GOOGLE_DRIVE_DATA_ROOM_FOLDER_ID`, falling back to the private curated room
`1GjNWfzNvPtFmsy0IMddsqy4ghlezjscD`. Dashboard documents, new-link pickers and new
links use this value. Existing `room_links` retain their saved `drive_folder_id`,
tokens, audiences, expiry, file selections and analytics; no database migration is
required or authorized. Their Edit files picker loads that saved folder through an
authenticated admin endpoint. Never replace existing selections with new-room IDs.

The private room contains native Drive shortcuts. `lib/drive-reader.ts` preserves
shortcut IDs as the visible IDs and resolves target metadata/content on the server.
A shortcut target ID is not an alternative authorized investor URL. List and file
endpoints enforce the active link, expiry, verified allowed email and selected file
membership. Explicit downloads and non-preview content are denied on view-only links.
PDF/image rendering necessarily sends their bytes to the authorized browser; this
setting is not DRM. Newly saved selections are explicit snapshots; an empty selection
does not become all files, and later additions are not automatically included.

Email verification uses the HttpOnly `dcc_room_v2_*` cookie at `/` so the page and
its API endpoints receive the same credential. Previously verified visitors will
verify once again after deployment. `JWT_SECRET` must be configured; do not print it.

Use Node 22.13+ (Vercel runtime: 22.x). The Mac's system Node is older; the checks
were run through `npm exec --yes --package=node@22 -- npm test` and the corresponding
`npm run build`. The PDF worker is copied from the installed PDF.js package to
`public/pdf.worker.min.mjs` by prebuild/predev, avoiding a third-party worker CDN.
The checked-in vercel.json uses `npm run build:vercel`. Its mandatory readiness step
checks the actual deployment environment can read the approved private room and
preview bytes and execute SELECT 1 against the existing database. Failure stops
publication and retains the prior production deployment. It does not print secrets,
write database records or require secrets to be downloaded into this checkout.
The check is required even if Vercel system variables are disabled. Verify the
worker URL after deployment.

## Before the production pointer changes

1. The concrete folder/reference manifest is approved and applied; see DCC Cloud
   implementation/2026-11-11-data-room-refresh. Preserve every folder, reference and
   edition; do not change permissions.
2. Verify this is existing Vercel project `dcc21/dcc-landing`, linked to
   `micheledcc/dcc-landing`. Baseline commit `3f6144ce0e8a41c0cb90da5498b9c4a8f6cd77f2`
   has a successful Vercel deployment check. Preserve its rollback deployment.
3. Verify the production Google OAuth identity can read the private room and targets.
   The Mac DCC helper account passed the read-only integration check; that does not
   establish the Vercel credential's identity. Do not copy secrets into this checkout.
   Any new access grant requires exact recipient/file/role approval; never make the
   private room public to solve a backend access error.
4. Apply and verify the approved reference-only reorganization, Finder section
   choices and Notion labels. Keep the private Drive root ID and Desktop path.
5. Run `npm test`, `npm run build` and, with the intended account's environment,
   `node --import tsx scripts/verify-data-room.ts`. This script only lists and reads
   three formats, reports hashes, and never writes Drive or database records.
6. Verify the staged deployment's admin picker, shortcut PDF/image previews,
   download controls, denied unselected IDs and legacy-link compatibility. Do not
   email investors or create public test links as part of verification.
7. Deploy to the existing Vercel project, then verify its production alias, worker,
   default room and error status. Do not run `db:setup`, `db:seed` or modify existing
   investor-link rows. Git publication and deployment outcomes are recorded in the
   DCC Cloud refresh status; never infer them merely from prepared source files.
