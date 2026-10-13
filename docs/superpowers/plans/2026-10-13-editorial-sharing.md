# Editorial Sharing Implementation Plan

> **For agentic workers:** Execute this authorized plan task-by-task using superpowers:executing-plans; keep the incumbent design and production data.

**Goal:** Publish source-linked reading briefs, downloadable event cards and a real update stream.

**Architecture:** Versioned editorial JSON is joined read-only onto approved records when its fingerprint matches. Shared presentation functions feed React and server-rendered updates. PNG and QR rendering run in the reader's browser.

**Tech Stack:** React, TypeScript, Vite, Node 22, SQLite, browser Canvas, qrcode.

**Spec:** ../../EDITORIAL-20261013.md

## Global Constraints

- Preserve the live database, uploads, accounts, visitor keys and the two main sites.
- Event ordering remains occurrence/propagation-date ordering; updates use publication/change times.
- Editorial copy does not upgrade factual verification or invent missing sources.
- Original images remain unmodified; exported cards identify themselves as reading summaries.

## Review Focus

- Withdrawal removes both briefs and update references from public output.
- A subsequent admin correction invalidates stale editorial copy.
- Unsafe links and invalid attachment indexes must not become active links.
- Long Chinese titles and image-loading failures must leave a usable share card.
- Mobile expansion must not break the existing modal focus or original-image preview.

## Tasks

### 1. Editorial data and update model
- [x] Add failing tests for fingerprint matching, invalidation and public update ordering.
- [x] Add editorial.mjs and docs/editorial-briefs-20261013.json; bind eight summaries to current records.
- [x] Add frontend/reading.mjs and integrate extras in archive.mjs; preserve every stored field.
- [x] Verify with `node tests/editorial.mjs` and archive suite.

### 2. Reading and share surfaces
- [x] Add EventBrief.tsx, RecentUpdates.tsx, ShareCard.tsx and share-card.mjs.
- [x] Integrate into existing detail/home/header and scoped editorial.css.
- [x] Render PNG with whole-image contain, source context, QR and bounded text; lazy load renderer.
- [x] Verify typecheck and meaningful pure rendering/layout tests; inspect actual exported PNG in browser.

### 3. Public updates and deployment
- [x] Add /updates to server rendering, sitemap and navigation; include briefs in event HTML.
- [x] Extend Docker runtime copy and release test gates.
- [x] Run build, full suites and one desktop/mobile browser pass; batch material fixes and confirm.
- [x] Complete scoped design review/document handoffs.
- [ ] Publish exact GitHub revision and deploy; acceptance is recorded against the resulting commit in the release manifest and runtime report.
- [ ] Confirm live endpoints, screenshots, version equality and unchanged legacy data; write acceptance report.
