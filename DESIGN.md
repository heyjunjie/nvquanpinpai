---
name: 女拳品牌观察
description: A serious newspaper frame for a source-aware consumer archive.
colors:
  ground: "#fafaf8"
  surface: "#f0f0ec"
  ink: "#222420"
  muted: "#62645e"
  line: "#d9dad4"
  accent: "#8b2631"
  accent-hover: "#6e1d26"
  white: "#fff"
typography:
  display:
    fontFamily: "'Noto Serif SC','Source Han Serif SC','Songti SC','SimSun',serif"
    fontSize: "34px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0"
  headline:
    fontFamily: "'Noto Serif SC','Source Han Serif SC','Songti SC','SimSun',serif"
    fontSize: "27px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: ".015em"
  title:
    fontFamily: "'Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: "19px"
    fontWeight: 700
    lineHeight: 1.6
  body:
    fontFamily: "'Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: "15px"
    fontWeight: 400
    lineHeight: 1.75
  label:
    fontFamily: "'Microsoft YaHei UI','PingFang SC',sans-serif"
    fontSize: "12px"
    fontWeight: 400
rounded:
  flat: "0"
  control: "3px"
  review: "4px"
  dialog: "6px"
spacing:
  compact: "8px"
  control: "12px"
  inset: "16px"
  mobile: "18px"
  panel: "24px"
  margin: "28px"
  column: "44px"
components:
  button-primary:
    backgroundColor: "{colors.accent}"
    textColor: "{colors.white}"
    rounded: "{rounded.control}"
    padding: "12px 18px"
  button-primary-hover:
    backgroundColor: "{colors.accent-hover}"
    textColor: "{colors.white}"
  button-text:
    textColor: "{colors.accent}"
    padding: "10px 0"
  button-search:
    backgroundColor: "{colors.ink}"
    textColor: "{colors.white}"
    rounded: "{rounded.flat}"
    padding: "10px 16px"
  filter-chip:
    backgroundColor: "{colors.surface}"
    padding: "5px 10px"
  directory-row:
    rounded: "{rounded.flat}"
    padding: "15px 0 17px"
  dialog:
    backgroundColor: "{colors.ground}"
    rounded: "{rounded.dialog}"
    padding: "32px"
---

# Design System: 女拳品牌观察

## Overview

**Creative North Star: "Serious Newspaper Archive"**

White paper, near-black ink, quiet grey rules and restrained oxblood actions make an archive meant to be read and checked. Chinese serif headings provide editorial hierarchy; sans-serif copy and controls keep dense records usable. This describes the implemented Read surface and its account, submission and moderation Operate surfaces.

Evidence is the imagery: existing uploaded documents, screenshots and videos retain their proportions and accompanying attribution. There are no newly commissioned raster assets or image-generation comps. Attachment metadata carries provenance; sample review images are not reusable decorative assets.

**Key Characteristics:**
- Flat directory rows separated by rules.
- Serif editorial hierarchy with sans-serif reading and controls.
- Source context stays beside evidence.
- Progressive disclosure preserves reading continuity.

Source authority: `frontend/main.tsx` loads `style.css` before `phase-two.css`; this document records their resulting cascade, sampled against `Homepage.tsx`, `SiteHeader.tsx`, `EvidenceReader.tsx`, `App.tsx`, `Community.tsx`, `ArchiveUI.tsx` and `ImagePreview.tsx`. Product commitments and the surface contract supply the approved world, not additional token values.

## Colors

The palette is paper-like and quiet, with an oxblood accent for actionable elements and selected states.

The sidecar's eight-step OKLCH ramps are synthesized swatch previews required by the documentation panel; they are not additional shipped color tokens.

### Primary
- **Oxblood** (`accent`): primary actions, text actions, bookmarks, selection outlines and the visitor chart series.
- **Deep Oxblood** (`accent-hover`): primary button hover.

### Neutral
- **Paper** (`ground`): page and dialog canvas.
- **Inset Paper** (`surface`): fact panels, filters, empty states and thumbnail beds.
- **Ink** (`ink`): reading text, major rules, search action and contributor chart series.
- **Quiet Ink** (`muted`): metadata and supporting explanations.
- **Fine Rule** (`line`): row divisions, secondary borders and column separators.
- **White** (`white`): contrast text on filled controls and the search field surface.

**The Action Accent Rule.** Use oxblood to identify actions and selection; content hierarchy rests on ink, type and rules.

## Typography

**Display Font:** the Chinese serif stack in `display`; the masthead uses the same stack at 25px/800 with .025em tracking.
**Body Font:** the Chinese UI sans-serif stack in `body`, inherited by controls.

These are intentional installed-font stacks for Chinese Read/Operate content. No font files are bundled; glyph shape and metrics depend on the reader's available fonts.

### Hierarchy
- **Display:** introductory heading uses `display`; 30px at 1100px and below, 28px/1.55 at 600px, 26px at 360px.
- **Headline:** section headings use `headline`; 24px at 600px, 22px at 360px. Sidebar headings are 21px, then 22px on phones.
- **Title:** event titles use `title`; 17px/1.65 at 600px and 16px at 360px. Brand titles use 21px/1.4, then 19px and 17px.
- **Body:** base reading uses `body`; detailed evidence text uses 15px/1.95, then 14px on phones. Introductory explanation uses 15px/1.95, then 13px/1.85.
- **Label:** ordinary metadata uses `label`; secondary captions range from 10–13px. Counts use tabular numerals. Primary statistics use 34px/600; the third statistic uses 21px.

**The Read and Operate Rule.** Serif marks editorial structure; sans-serif carries records, numeric values and controls.

## Layout

The page container is centered with a 1336px maximum outer width and 28px horizontal padding. The sticky masthead is 76px high. The introductory strip uses two equal columns, a 44px gap and 32px/30px top/bottom padding; its height follows text, rather than a fixed 150px contract sketch.

The main reading area uses a flexible column plus a 288px sidebar, separated by a 44px gap; the sidebar adds 28px left padding and a fine vertical rule. At 1500px and above the sidebar is 310px with a 48px gap and 32px inset. At 1100px and below it is 254px with a 28px gap and 22px inset. This is a fixed-width margin beside flexible reading space, not a literal 2:1 grid.

At 850px and below, navigation moves to an explicit menu and the sidebar follows the entire reading column. At 601–850px the sidebar uses two columns. At 600px and below it becomes one column, the header becomes 64px, page padding becomes 18px, and the introduction stacks. At 360px and below horizontal padding becomes 14px. The brand directory deliberately stays two columns throughout, with gutters of 26px, 24px, 18px and 14px as the viewport narrows.

Event rows normally pair an 84px date column with content and a 100px media column. Dates move above content at 1100px, return to a 90px date column in the stacked 601–850px layout, and move above again on phones. Phone media widths are 82px, then 68px at 360px; image heights are 118px, then 104px. Large section separations use 42px top margin plus 22px top padding, reduced to 32px/20px on phones.

The statistics order is cumulative visitors, contributors, approved contributions; the latter spans the full metrics width. Chart and ranking are disclosure content. Numbers come from the server and must never be fixed to screenshot examples.

## Elevation & Depth

Reading surfaces stay flat. Fine rules, inset paper and whitespace distinguish information. Dialogs use a translucent backdrop (`#17191699`) rather than a card shadow; the full-window image viewer uses `#1f221ff5`. Header, overlay, toast and image viewer use stacking levels 5, 20, 30 and 50. The skip link uses 100.

### Shadow Vocabulary
- **Transient toast:** `0 12px 32px #0006`, inherited from the base stylesheet, only for a floating status message.

**The Flat Reading Rule.** Keep directory and event surfaces flat; reserve overlay depth for a temporary reading or status layer.

## Shapes

Directory rows, evidence beds and fact panels have square corners. Controls use the small `control` radius; moderation cards use `review`; dialogs use `dialog`. Fine borders are normally 1px. Active tabs use a 2px underline and selected thumbnails use a 2px oxblood outline with 1px offset. These are selection signals, not ornamental accents.

## Components

### Buttons
Compact, explicit and text-led. Primary and small-primary share 12px/18px padding and a 44px minimum height; primary hover deepens the accent. Text actions are oxblood. Icon actions use outlined SVGs with accessible labels and selected states where applicable. Most controls have 44px minimum targets; removable filter chips use 36px and some narrow inline icons use 32px widths. Do not infer a universal 44px guarantee from the dominant pattern.

Focus-visible is a 2px oxblood outline with 4px offset; image-preview buttons use white outlines. Button color transitions last .16s. Reduced motion removes transitions and animations and switches smooth page scrolling to automatic scrolling.

### Chips and tags
Removable active filters use inset paper, a fine border, 5px/10px padding and a close SVG. Timeline metadata is inline text separated by middle dots. Detail tags retain fine bordered labels with 3px corners; do not turn the timeline text treatment into a universal ban on bordered tags.

### Cards / Containers
Brand entries are unfilled, ruled rows with 15px/17px vertical padding. Brand names open their archive; summaries show two lines, and bookmarks have independent pressed state. Responses and opinions use flat single-column rows. Moderation cards retain a fine border, 4px corners and 24px padding, reduced to 16px on phones.

### Inputs / Fields
Search is a square white field with a subdued outline, integrated ink action and a 2px oxblood focus-within ring offset by 2px. Submission/account controls are 16px, minimum 44px high and use 3px corners. Two-field form rows stack on phones. Existing base form border and label colors remain as inherited implementation details; the root palette does not broaden to promote them.

### Navigation and filters
Desktop navigation is plain sans-serif text. The mobile menu has an explicit expanded state and sits below the masthead; selecting a link or pressing Escape closes it. A visible-on-focus skip link targets the main region. The directory's two pressed-state tabs are followed by a disclosure for topic, material status, publisher relationship and region. Active conditions remain visible when the disclosure closes; each can be removed, and all conditions can be reset. Search updates results as typed; submitting moves focus to the result region without scrolling. Loading, failure and empty states have explicit copy and recovery actions.

### Evidence reader and dialogs
Standard dialogs are 620px wide; detail dialogs are capped at 1000px and the viewport width. Desktop padding is 32px and maximum height is `calc(100dvh - 48px)`. At 600px and below they become bottom sheets, maximum 95dvh, with 24px/18px padding, safe-area bottom space and 6px top corners. The close control remains sticky inside the scrolling surface.

Opening a dialog locks background scroll, marks non-dialog root children inert, focuses the first available control and wraps Tab between first and last controls. Closing restores the prior connected element. Escape dismisses the top relevant layer; image preview returns to its event. Brand, event and attachment routes retain independent hash links and the event records its return context.

Images and videos use contain sizing. The reader bed is `min(48dvh,460px)` high, or 36dvh with a 210px minimum on phones. Thumbnail buttons are 70×76px, then 58×64px on phones, in a horizontally scrolling strip. Images precede videos; previous/next controls disable at bounds. The selected thumbnail has a pressed state. Source captions and disclosure remain associated with each attachment. Failed media has a retry state; absent media has explanatory text.

The image preview starts fit-to-window without upscaling, offers width-fit and native size, zooms in .25 increments from .5 to 4 relative to the selected fit mode, and permits scrolling at enlarged sizes. Its toolbar wraps on narrow screens. Original-image download and close remain explicit controls.

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

Not canonized or repaired: inherited blue-grey form labels/borders, 10px secondary metadata and narrowed inline hit areas are existing drift or legibility constraints, not expanded palette/type/target rules. Hidden legacy eyebrows remain hidden. Intentional Chinese serif/sans stacks are the approved Read/Operate choice, not a system-display defect. This documentation pass changes no interface behavior.
