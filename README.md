# ADF Forge

Tri-service Australian Defence Force reference (Navy • Army • Air Force). Pure vanilla, fully offline, local-assets-only SPA. All content data-driven from `data.js`. Rich cards, modals, glossary cross-refs, interactive maps (JPG + SVG overlays), study tools.

## Open it

- Finder: double-click `index.html`
- Terminal: `open index.html`

Works from `file://` with zero external calls after load. No build step, no bundler, no CDN.

## Layout & files

- `index.html` — hero, nav, all sections (Air Force / Navy / Army platforms, Weapons & Systems, Bases map + side panel, Ranks & Leadership, Cyberspace, Glossary, Study Tools), the two maps (australia + world), modals.
- `data.js` — **the single source of truth**. BASES (18 tri-service entries with optional image + lat/lng), AIRCRAFT, NAVY, ARMY, WEAPONS, SYSTEMS, ADVERSARY, GLOSSARY (terms + aliases + whyItMatters), RANKS, PFA_STANDARDS, etc.
- `script.js` — renderBaseCard (aerial preview + live GMaps satellite link), selectBase, grid builders, wrapGlossaryTerms + tooltips + cross-ref clicks, modal logic, study engines (flash/quiz/whoami/matching with localStorage), showSection, etc.
- `styles.css` — CSS vars (navy/gold), Rajdhani font-face (self-hosted from fonts/, graceful fallback), .base-dot / map styles, cards, modals, responsive.
- `images/` — australia-map-cropped.jpg + world-map.jpg (the map visuals), 16 *_base.png aerials, platform photos (~150), leadership photos.
- `fonts/` — Rajdhani woff2 (4 weights). Optional; site works without (see fonts/README.md).

## Editing / adding content

1. Edit the relevant object in `data.js` (copy-paste an existing entry, tweak id/name/etc).
2. For new base: add entry to BASES + the <g class="base-dot" data-base="newid"> + <text> label in the australia-svg in index.html (use calib click for coords). Add image + lat/lng for aerial + satellite link.
3. For new platform/weapon: add to the right array in data.js; the grids are auto-built.
4. Glossary terms get auto-wrapped for tooltips + previewMap links in most descriptions.

Hybrid maps note (for devs): JPGs are the passive background visuals (inset inside fixed viewBox so coords never shift). All dots, labels, clicks, hovers and calib are SVG overlay elements inside the <svg>.

## Splits & scope

- This site (ADF Forge) is the clean tri-service reference. No "interview prep" framing, no model answers, no salaries, no training pipelines.
- The study / prep material lives in the sibling folder `alpha-interview-prep` (kept separate so this one can be published if desired).
- Study tools (flashcards etc) are still included here for personal/reference use.

## Working on it

Describe the desired change in plain English. Changes are made with targeted edits + minimal verification. Git tags are created before significant batches.

Current state includes: all 18 bases with right-of-dot white labels, lazy-loaded images, aerial previews + GMaps links for 16 bases, fully cross-linked glossary terms, tri-service generalization, etc.

## Fonts note

Rajdhani is referenced via @font-face in styles.css pointing at `fonts/rajdhani-*.woff2`. If the actual files are not present the browser falls back to the sans-serif stack. Download the 4 weights (300/400/500/600) from Google Fonts or a similar source and drop them in `fonts/` to enable the exact typeface.

## License / use

Personal reference project. Not an official ADF or Commonwealth site.
