---
version: 1
slug: "frontend-homepage-tsx"
primary_target: "frontend/Homepage.tsx"
related_targets: ["frontend/App.tsx","frontend/phase-two.css","frontend/Community.tsx"]
---

# notbuy.top 查阅首页与资料阅读

Mode: Read; submission and moderation: Operate. Scope: public homepage, responsive navigation, record reading, media preview, account and moderation layout. Existing factual copy, approved statement, backend data and access rules retained.

## Direction contract

THESIS: A usable consumer archive in a serious newspaper frame. Readers reach brand records from the first viewport instead of scrolling past a full-screen slogan.

OWN-WORLD: White paper, near-black ink, muted grey rules and restrained oxblood actions. Chinese serif masthead and section titles, sans-serif reading and controls. Flat directory rows and dated event entries; no decorative cards or side accents.

STORY: Search a brand, inspect its chronological events, open evidence on the same page, then review source, response and uncertainties. A persistent desktop margin explains the archive and shows real server statistics; it follows the reading column on mobile.

FIRST VIEWPORT: 76px masthead, compact 150px introductory strip; below it a 2:1 reading/margin grid. Brand heading, search and first directory entries visible at 1280x720. Mobile uses a compact masthead with an explicit menu and a single reading column. Signature interaction: a media reader with thumbnail selection, fit-to-window preview and return to the originating record without losing context.

FORM: The user's pinned light serious newspaper world overrides the random material assignment. Seven considered structures: newspaper directory; reference index; consumer report; public archive register; annual review; annotated chronology; investigative dossier. Seed 38214254 assigned 6, whose date-led browsing becomes the timeline below the user-prioritized brand directory. All six external challengers declined on audience fit and clarity: marker zine, film bench, civic ribbon, coded record sleeve, curved paper shell, exposed binding. Retained disciplines: clear progressive disclosure, explicit selection state, whitespace, precise indexing, responsive structure and navigable sections. No foreign decoration adopted. Code-led Read surface.

FINISH: unreviewed and undocumented is unfinished; this build ends with the finish review, the verdict, DESIGN.md, and every shipping raster carrying its provenance

## Implemented extension: topic discovery and source statistics

The existing newspaper direction continues through standalone topic/archive pages (`discovery.mjs`, `public/discovery.css`), homepage topic links (`frontend/Homepage.tsx`, `frontend/phase-two.css`) and the administrator source-statistics disclosure (`frontend/GrowthStats.tsx`). Topic pages use a single reading column; the homepage digest follows the brand directory; source counts remain a separate administrator table with attribution limits. No new raster assets, fonts or visual world were introduced. Exact implemented dimensions and component variants are recorded in root `DESIGN.md`; `.impeccable/design.json` includes their previews.

## Implemented extension: editorial briefs, recent updates and share exports

Ordinary extension checked on 2026-10-13 against `PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json`. The existing Serious Newspaper Archive world, token primitives, named rules and sidecar remain unchanged. Implementation evidence: `frontend/EventBrief.tsx`, `frontend/RecentUpdates.tsx`, `frontend/ShareCard.tsx`, `frontend/share-card.mjs`, `frontend/editorial.css`, their integration in `App.tsx` / `Homepage.tsx` / `main.tsx`, and the `/updates` renderer in `discovery.mjs` with `public/discovery.css`.

The brief follows evidence media inside the existing dialog. Fine top/bottom rules frame its serif section heading (25px, 22px below 600px), sans-serif summary (17px, then 16px), dated context, factual points, references, response and uncertainties. Its 110px label column collapses to stacked labels below 600px. Oxblood underlined references and existing visible focus outlines continue the Action Accent and Read and Operate rules. No new decorative container or elevation vocabulary is introduced.

Recent updates are flat ruled entries in the homepage reading column, using 17px linked titles (16px below 600px), 13px tabular metadata and 14px supporting text. The standalone `/updates` page reuses the discovery reading layout and serif record headings, including wrapping at 320px. Site update timestamps and event dates remain visibly distinct. This is a surface extension, not a new global typography scale.

Share controls are an inline native disclosure inside the event, with 44px minimum control heights, 3px control corners, an ink-filled pressed orientation state and an inset-paper preview bed. Preview images use contain sizing, maximum 100% width and 64dvh height. The 1080×1440 portrait and 1200×800 landscape PNG exports reuse paper, ink, muted text, fine rules and the approved Chinese serif/sans stacks; export-coordinate font sizes are local to the canvas and are not new UI tokens. They retain an uncropped source thumbnail, date meaning, response, source/credit, verification caveat and event QR. These PNGs are generated derivatives of existing record material and text, not newly commissioned or generated illustration assets; source provenance remains with the original attachment metadata. Loading, retry, text-only fallback and user-triggered save/share are explicit in the component source.

Checked visual evidence in `.impeccable/review/`: `editorial-home-desktop.png`, `editorial-brief-desktop.png`, `editorial-brief-mobile.png`, `editorial-mobile-share.png`, `editorial-updates-desktop.png`, `editorial-updates-320.png`, `editorial-portrait.png`, and `editorial-landscape.png`. All eight were inspected in this documentation pass for the existing palette/type pairing, flat rules, mobile wrapping, source-image proportions and export hierarchy. The finish-review handoff reports disposition `ship` with no required fixes and independent successful QR decoding for both exports; QR decoding was not rerun by the documenter. No pre-existing drift was repaired or promoted into a design rule. See `docs/EDITORIAL-20261013.md` for functional and data boundaries.

## Implemented extension: followed updates, evidence tasks and content metrics

Ordinary extension checked on 2026-10-13. `PRODUCT.md`, `DESIGN.md` and `.impeccable/design.json` are preserved byte-identically; the newspaper world, palette/type primitives and named rules remain incumbent. Source evidence: `frontend/WatchUpdates.tsx`, `frontend/TaskBoard.tsx`, `frontend/TaskAdmin.tsx`, `frontend/ContentStats.tsx`, `frontend/participation.css`, integration in `App.tsx`, `Homepage.tsx`, `Community.tsx` and `main.tsx`, plus `discovery.mjs` and `public/discovery.css`. Functional/data scope is recorded in `docs/PARTICIPATION-20261013.md`. No generated raster or new font family is introduced.

Followed updates and the homepage task board use flat ruled sections with a 2px ink top rule, 16px top inset and 32px/40px vertical margins (26px/32px below 600px). Unread entries use 17px/1.65 sans-serif titles, 13px muted metadata and SVG navigation arrows; titles become 16px on phones. The section appears only for followed brands, previews three unread events, supports expansion and marking all read, and explicitly explains browser-local persistence. Single-brand RSS links sit within a native disclosure with 44px minimum-height links/summary; the brand dialog exposes the same follow/RSS controls.

Tasks retain the existing source-aware reading hierarchy: brand/type/status, a specific request, the associated event and a submission action. Homepage rows show three open tasks; event details show their own tasks. React task titles use 20px/1.55 (18px on phones; 17px in compact event rows), and 15px/1.85 copy. Completion evidence is a fine bordered paper block with a linked public record, contributor credit and a limitation statement. The standalone `/tasks` route reuses the discovery column and ruled lists with 22px task titles, reduced to 19px below 600px. Its CTA is plain linked text; the reviewed Unicode arrow is absent from current source and is not recorded as an icon pattern.

Task-linked submissions retain the existing dialog and add a bordered 14px-inset context block containing the task request. Task administration uses native disclosures, an existing form vocabulary, 700px maximum form width, 16px form gaps and stacked form rows below 600px. The interface distinguishes creating, reviewing public completion evidence, reopening and archiving. These are local extensions of Read and Operate, not new system tokens.

Content statistics use an initially closed native disclosure and flat per-page metric rows. The six values remain ordered as views, share clicks, download clicks, form openings, received submissions and currently public submissions. Definition lists use six columns with 16px gaps on desktop, then three columns/two rows with 18px vertical and 10px horizontal gaps below 600px. Labels remain 13px; tabular values are 24px/1.3, reduced to 23px on phones. Linked record titles and a separate entrance/source list provide context without a new chart or palette. Estimation, deduplication and click-versus-completion limitations remain visibly adjacent to the report. Loading, empty, failure/retry and refresh states are explicit in component source.

Actual images inspected in `.impeccable/review/`: `participation-home-desktop.png`, `participation-tasks-desktop.png`, `participation-tasks-mobile.png`, `participation-submit-mobile.png`, `participation-watch-desktop.png`, `participation-stats-desktop.png`, `participation-stats-desktop-lower.png`, `participation-stats-mobile.png`, and `participation-stats-320.png`. The pass checked the retained first viewport, task/reader hierarchy, form context, visible unread/RSS states, readable numeric grouping and narrow-screen wrapping. The final finish-review disposition was not yet supplied at this handoff; this note does not claim that verdict. Existing drift is neither repaired nor canonized, and screenshot fixture counts/records are not design constants.
