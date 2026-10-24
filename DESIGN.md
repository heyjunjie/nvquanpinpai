---
name: 女拳品牌观察
description: A serious newspaper frame for a source-aware consumer archive.
colors:
  ground: "#faf9f5"
  surface: "#f0eee7"
  ink: "#262722"
  muted: "#62635c"
  line: "#d8d8cf"
  accent: "#8b2631"
  accent-hover: "#6e1d26"
  white: "#fff"
typography:
  display:
    fontFamily: "'NotBuy Newsreader','NotBuy Song','Noto Serif SC','Source Han Serif SC','Songti SC',serif"
    fontSize: "clamp(38px, 3.8vw, 57px)"
    fontWeight: 700
    lineHeight: 1.26
    letterSpacing: "-.03em"
  headline:
    fontFamily: "'NotBuy Newsreader','NotBuy Song','Noto Serif SC','Source Han Serif SC','Songti SC',serif"
    fontSize: "35px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-.02em"
  title:
    fontFamily: "'NotBuy Newsreader','NotBuy Song','Noto Serif SC','Source Han Serif SC','Songti SC',serif"
    fontSize: "29px"
    fontWeight: 700
    lineHeight: 1.25
    letterSpacing: "-.02em"
  body:
    fontFamily: "'Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: "16px"
    fontWeight: 400
    lineHeight: 1.8
  label:
    fontFamily: "'Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  flat: "0"
  control: "2px"
  inherited-control: "3px"
  review: "4px"
  dialog: "4px"
  phone-dialog: "5px"
spacing:
  compact: "8px"
  control: "12px"
  inset: "16px"
  mobile: "20px"
  panel: "24px"
  margin: "32px"
  dialog: "36px"
  column: "44px"
  spread: "48px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "12px 19px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.white}"
  button-text:
    textColor: "{colors.accent}"
    padding: "10px 0"
  button-search:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "10px 19px"
  filter-chip:
    backgroundColor: "{colors.surface}"
    padding: "5px 10px"
  directory-row:
    rounded: "{rounded.flat}"
    padding: "21px 0 23px"
  dialog:
    backgroundColor: "{colors.ground}"
    rounded: "{rounded.dialog}"
    padding: "36px"
---

# Design System: 女拳品牌观察

## Overview

**Creative North Star: "Serious Newspaper Archive"**

Warm paper, near-black ink, quiet grey rules and restrained oxblood actions make an archive meant to be read and checked. Self-hosted Latin and Chinese serif headings provide editorial hierarchy; sans-serif copy and controls keep dense records usable. The shared Chinese / English React application carries the public Read surface and its account, submission and moderation Operate surfaces.

Evidence is the imagery: existing uploaded documents, screenshots and videos retain their proportions and accompanying attribution. There are no newly commissioned raster assets or image-generation comps. Attachment metadata carries provenance; sample review images are not reusable decorative assets.

**Key Characteristics:**
- Flat directory rows separated by rules.
- Serif editorial hierarchy with sans-serif reading and controls.
- Source context stays beside evidence.
- Progressive disclosure preserves reading continuity.

Source authority: `frontend/main.tsx` loads `style.css`, `phase-two.css`, `editorial.css`, `participation.css`, `international.css`, `editorial-fonts.css`, then `journal.css`. The final cascade, sampled against `Homepage.tsx`, `SiteHeader.tsx`, `EvidenceReader.tsx`, `App.tsx`, `Community.tsx`, `ArchiveUI.tsx` and `ImagePreview.tsx`, is normative here. The 2026-10-25 authorized editorial refinement merges the implemented palette, type and spacing changes into the incumbent system; the approved world and named rules continue. The code-led seed is 38214254; no approved image comp exists.

Extension evidence: `discovery.mjs`, `public/discovery.css`, `frontend/GrowthStats.tsx` and earlier editorial/participation components remain historical or scoped variants. Standalone-discovery measurements below describe their own stylesheet, not the current shared homepage. This pass preserves those unrelated variants rather than refreshing their literal palette or installed-font stacks.

## Colors

The palette is paper-like and quiet, with an oxblood accent for actionable elements and selected states.

The sidecar extends these source colors with role metadata; it does not invent additional palette steps.

### Primary
- **Oxblood** (`accent`): primary actions, text actions, bookmarks, selection outlines and the visitor chart series.
- **Deep Oxblood** (`accent-hover`): primary button hover.

### Neutral
- **Paper** (`ground`): page and dialog canvas.
- **Inset Paper** (`surface`): fact panels, filters, empty states and thumbnail beds.
- **Ink** (`ink`): reading text, major rules, search action and contributor chart series.
- **Quiet Ink** (`muted`): metadata and supporting explanations.
- **Fine Rule** (`line`): row divisions, secondary borders and column separators.
- **White** (`white`): contrast text on filled controls.

**The Action Accent Rule.** Use oxblood to identify actions and selection; content hierarchy rests on ink, type and rules.

## Typography

**Display Font:** the locally hosted Newsreader / Noto Serif SC subset stack recorded in `display`; masthead (31px/700, 1.2 line-height, -.025em tracking).
**Body Font:** the Chinese UI sans-serif stack in `body`, inherited by controls.

`editorial-fonts.css` registers `NotBuy Newsreader` at weights 400–700 in three Unicode-range WOFF2 files, and `NotBuy Song` at 600 and 700 using one Chinese subset file. `index.html` preloads that Chinese file. `public/fonts/sources.json` records origins, hashes and OFL-1.1 licenses; the associated license files ship alongside the fonts. The Chinese subset covers known interface and public-title glyphs, not arbitrary future records; remaining characters use the declared serif fallback. Font assets are typography infrastructure, not evidence imagery.

### Hierarchy
- **Display:** introduction uses `display`; at 850px and below it is 39px, then `clamp(31px, 8.6vw, 39px)` with 1.26 line-height and -.025em tracking at 600px.
- **Headline:** section headings use `headline`; 29px on phones and 27px at 360px. Sidebar headings are 28px/1.3, then 30px below 850px.
- **Title:** brand titles use `title` (26px below 1100px, returning to 29px on phones). Event titles use serif 26px/1.45, 24px below 1100px and 22px on phones. Dialog titles use `clamp(28px, 3vw, 38px)`/1.45, becoming 29px on phones.
- **Body:** base reading uses `body`; detail content is 16px/1.95, then 15px on phones. Desktop intro copy is 15px/1.7 in the compact first viewport; phone intro copy is 14px/1.9. Explanatory text uses observed caps of 49ch (intro), 70ch (tasks) and 52ch (statement).
- **Label:** ordinary metadata uses `label`; archive captions and secondary counts commonly use 11–13px. Counts use tabular numerals. Primary statistics use serif 49px/600/1.15 (44px below 1100px, 49px on phones); approved-submission totals use sans-serif 23px/600.

**The Read and Operate Rule.** Serif marks editorial structure and prominent statistics; sans-serif carries record descriptions, metadata and controls.

Standalone discovery pages retain their earlier installed-font serif/sans pairing with a local reading scale: 16px/1.85 body, 34px/1.5 main heading, 23px/1.6 section headings and 14px metadata. The masthead is 28px/700 with 1.5 line-height. At 600px and below, these headings become 26px and 21px, and the masthead becomes 24px. Headings balance wrapping; paragraphs are capped at 72ch. These are scoped reading-page variants, not replacements for the homepage type ramp.

## Layout

The shared public page is centered at a 1440px maximum outer width with 32px horizontal padding. The sticky masthead is 94px high. Its inner alignment uses `max(32px, calc((100vw - 1376px) / 2))`. The introductory spread uses 1.08fr/.92fr columns with a 70px gap. At desktop widths of at least 851px it compacts to 20px/18px top/bottom padding and 24px bottom margin; search is 60px minimum high, tabs 44px, result status 40px and brand rows begin with 16px top padding. These are deliberate viewport-fit values, not the original provisional 150px introduction.

The main grid uses a flexible reading column plus a 286px margin, a 48px gap and 28px left margin inset. At 1100px and below, the margin is 250px, the gap 30px and inset 22px; the intro gap is 40px. At 850px and below, the main layout stacks with a 52px gap, and the margin gets a 30px top inset and horizontal ink rule. Its inherited two-column sublayout survives at 601–850px; phones use one column.

Navigation collapses as a complete unit at 1350px, with 44px links in the explicit menu below the masthead. The site tag hides through 1600px. At 600px and below the masthead becomes 76px, horizontal page/header insets become 20px, the intro stacks, the masthead type becomes 23px and both the language link and the non-shrinking menu slot reserve 44px. Account and submission actions remain in the menu. At 360px and below insets become 16px and masthead type 21px; the archive-span auxiliary row hides to prioritize lookup. Its years remain in the timeline and records.

The brand directory uses two columns with a 44px gutter (28px below 1100px, then 38px at 601–850px) and becomes a single column on phones. Phone rows use 20px/22px vertical padding. Sections in the reading column separate with 52px top margin and 27px top inset, reduced to 37px/23px on phones. The statement uses a .65fr/1.35fr spread with 64px gap, then stacks on phones.

Event rows retain the inherited responsive date column. Their content/media split uses a 108px evidence column and 28px gap, then 78px and 17px on phones; image heights are 148px, then 112px. Source images retain contain sizing. The final journal overrides the old 360px title/media shrink rules; do not reintroduce those older values on the shared page.

The statistics order is cumulative visitors, contributors, approved contributions; the latter spans the full metrics width. Chart and ranking are disclosure content. Numbers come from the server and must never be fixed to screenshot examples.

Standalone archive and topic pages use one centered reading column, capped at 980px with 28px padding, reduced to 20px at 600px. The header has content-driven height and 24px bottom padding. Text navigation wraps with 12px row and 24px column gaps. Topic entries are full-width ruled rows with 24px vertical padding; the footer is separated by a fine rule, 40px top margin and 20px top padding. This surface has no statistics sidebar. The homepage topic digest sits after the brand directory and before the event timeline; its final shared-page section spacing follows the journal rhythm above.

## Elevation & Depth

Reading surfaces stay flat. Fine rules, inset paper and whitespace distinguish information. Dialogs use a translucent backdrop (`#24251fe0`) and soft ambient depth; the full-window image viewer retains `#1f221ff5`. Header, overlay, toast and image viewer retain stacking levels 5, 20, 30 and 50. The skip link uses 100.

### Shadow Vocabulary
- **Paper dialog:** `0 22px 70px #11130e26`, for the temporary reader/form layer.
- **Transient toast:** `0 12px 32px #0006`, inherited from the base stylesheet, only for a floating status message.

**The Flat Reading Rule.** Keep directory and event surfaces flat; reserve overlay depth for a temporary reading or status layer.

## Shapes

Directory rows, evidence beds and fact panels have square corners. Primary/search controls and public form fields use `control`; inherited detail tags, close controls and share controls retain `inherited-control`. Moderation cards use `review`; dialogs use `dialog`, with `phone-dialog` top corners on phones. Fine borders are normally 1px. Active tabs use a 2px underline and selected thumbnails use a 2px oxblood outline with 1px offset. These are selection signals, not ornamental accents.

## Components

### Buttons
Compact, explicit and text-led. Primary and small-primary share 12px/19px padding, 46px minimum height and 600 weight; hover deepens the accent. Search is ink-filled with 48px minimum height. Text actions are oxblood. Icon actions use outlined SVGs and 44px minimum dimensions, accessible labels and pressed states. Legacy selectors still narrow certain inline phone icons to 32px; this is a recorded limitation rather than a target-size rule.

Focus-visible is a 2px oxblood outline with 5px offset; search focus-within uses a 3px offset. Image-preview buttons retain white focus outlines. Color, background and border transitions last 180ms with ease; SVG translation takes 260ms with `cubic-bezier(.16, 1, .3, 1)`. A selected bookmark receives a quiet tinted bed. Dialog entry uses one 300ms paper-open animation from .7 opacity, 14px downward offset and a 3% bottom clip to a fully visible sheet. Reduced motion removes animation, transition and smooth scrolling; content never depends on animation completing.

### Chips and tags
Removable active filters use inset paper, a fine border, 5px/10px padding, 40px minimum height and a close SVG. Timeline metadata is inline text separated by middle dots. Detail tags retain fine bordered labels with 3px corners; do not turn the timeline text treatment into a universal ban on bordered tags.

### Cards / Containers
Brand entries are unfilled, ruled rows with the `directory-row` padding (16px top in compact desktop, 20px/22px on phones). Brand names open their archive; summaries show two lines, and bookmarks have independent pressed state. Responses and opinions use flat single-column rows. Moderation cards retain a fine border, 4px corners and 24px padding, reduced to 16px on phones.

### Inputs / Fields
Search is a square transparent field with a subdued outline, integrated ink action and the focus-within ring described above. Public modal fields are 16px, minimum 48px high, with transparent backgrounds, 2px corners and 12px/14px padding. Modal labels use ink at 14px; placeholders use muted ink. Form gaps are 21px; two-field rows use 20px gaps and stack on phones. Field strokes (#a7a89d) and upload strokes (#98998f) are scoped control variants, not new global palette roles. Inherited administrator/legacy label and border literals remain outside this public refinement.

### Navigation and filters
Desktop navigation is plain sans-serif text. The mobile menu has an explicit expanded state and sits below the masthead; selecting a link or pressing Escape closes it. A visible-on-focus skip link targets the main region. The directory's two pressed-state tabs are followed by a disclosure for topic, material status, publisher relationship and region. Active conditions remain visible when the disclosure closes; each can be removed, and all conditions can be reset. Search updates results as typed; submitting moves focus to the result region without scrolling. Loading, failure and empty states have explicit copy and recovery actions.

### Evidence reader and dialogs
Standard dialogs are 620px wide; detail dialogs are capped at 1000px and the viewport width. Desktop padding is 36px and maximum height is `calc(100dvh - 48px)`. At 600px and below they become bottom sheets, maximum 95dvh, with 23px/20px top/side padding, 25px plus safe-area bottom space and 5px top corners. The close control remains sticky inside the scrolling surface.

Opening a dialog locks background scroll, marks non-dialog root children inert, focuses the first available control and wraps Tab between first and last controls. Closing restores the prior connected element. Escape dismisses the top relevant layer; image preview returns to its event. Brand, event and attachment routes retain independent hash links and the event records its return context.

The detail width is `calc(100vw - 64px)` capped at 1000px, returning to 100% on phones. Images and videos use contain sizing. The reader bed is `min(48dvh,460px)` high, or 36dvh with a 210px minimum on phones. Thumbnail buttons are 70×76px, then 58×64px on phones, in a horizontally scrolling strip. Images precede videos; previous/next controls disable at bounds. The selected thumbnail has a pressed state. Source captions and disclosure remain associated with each attachment. Failed media has a retry state; absent media has explanatory text.

The image preview starts fit-to-window without upscaling, offers width-fit and native size, zooms in .25 increments from .5 to 4 relative to the selected fit mode, and permits scrolling at enlarged sizes. Its toolbar wraps on narrow screens. Original-image download and close remain explicit controls.

### Topic digest and standalone reading
The homepage digest presents three plain linked rows under a section heading and a full-directory link. Each row uses 21px vertical padding and a fine bottom rule, a 19px/1.65 bold sans-serif title (17px on phones), and a 13px muted description with 6px top spacing and an outlined SVG arrow. Hover changes the title to oxblood; existing link focus rings apply. Rows navigate to standalone topic URLs.

Standalone pages retain the paper, ink, muted metadata and oxblood hover/focus palette using literal values in their own stylesheet. Their text navigation and linked serif record headings use ordinary document links. Date, record type and verification status precede each title; a summary is followed by publisher and contributor context. The response topic adds a response section and a native disclosure for unresolved details. Empty lists carry explanatory text. Images and videos on discovery-rendered records preserve proportions with a 100% maximum width, 70vh maximum height and contain sizing; original text preserves line breaks. This document-link surface and the interactive evidence reader share the same world but have distinct navigation behavior.

### Administrator source statistics
A native, initially closed disclosure introduces the last-30-days source report. Its container uses 24px vertical margin, 20px vertical padding and fine top/bottom rules; the summary is 20px/700 sans-serif. The full-width collapsed-border table uses tabular numerals, left-aligned source row headings, right-aligned numbers and fine horizontal rules. Cells use 12px/8px padding, reduced to 10px/4px and 14px type at 600px. There is no new chart or color scale.

The report shows source, deduplicated visitors and cumulative visitor-days. A second native disclosure holds daily values; a text action refreshes the report. Loading uses a status region, failure an alert, and no-data states retain explanation. Attribution limitations and the non-additive nature of channel counts stay next to the table. Values remain server-driven; this table is distinct from the public lifetime visitor count.

## Do's and Don'ts

### Do:
- **Do** preserve the Read and Operate type pairing and the source-aware evidence captions.
- **Do** use fine rules and whitespace to organize dense reading surfaces.
- **Do** retain visible keyboard focus, inert backgrounds and return context in layered readers.
- **Do** keep statistics server-driven and after the reading column on narrow screens.

### Don't:
- **Don't** introduce decorative card shadows or side accents into the flat reading surfaces.
- **Don't** replace evidence media with decorative imagery or crop away source context in the reader.
- **Don't** turn hidden legacy eyebrows into a visible house style.
- **Don't** treat screenshot counts or device-specific font rendering as fixed design tokens.

Not canonized or repaired: inherited standalone-discovery/global palette and installed-font measurements remain scoped legacy drift rather than the shared React system; inherited 10px metadata and narrowed inline hit areas remain legibility limitations, not a house scale or target rule. Public modal label/border styling is now refined, but unrelated administrator/base literals are not broadened into the palette. Hidden legacy eyebrows stay hidden; the surviving tiny masthead site tag is factual site identification, not a reusable invented kicker pattern. System sans-serif is body/control typography, not display. Screenshot fixture counts, automation cursor glow and individual source-image colors are not design tokens. This documentation pass changes no interface behavior.
