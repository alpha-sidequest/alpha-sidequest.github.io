# RAAF Knowledge Hub — Your Personal Defence Compendium

This is now your own encyclopedia for defence interview preparation.

## How to view the website (easiest ways)

### Option 1: Double-click (recommended for most people)
1. Open Finder
2. Go to your `alpha-sidequest` folder
3. Double-click the file called `index.html`
4. It will open in your web browser

### Option 2: From this terminal
Just type this and press Enter:

    open index.html

## The files (what each one does)

- `index.html` — The main page structure. You normally don't touch this.
- `styles.css` — All the colours, fonts, and layout. Only change if you want visual tweaks.
- `fonts/` — Self-hosted Rajdhani font files (no more Google Fonts calls). See fonts/README.md for download instructions.
- `script.js` — The interactive parts (clicking maps, opening modals, switching sections).
- `data.js` — **This is the most important file for you.**

### The data.js file (your main editing file)
This is where almost all future changes will happen:
- All the RAAF bases
- All the aircraft with their systems and "plain English" explanations
- All the current operations

Because we split the site, you (or I) can now safely add new aircraft, update numbers, fix text, or add new sections without risking breaking the whole website.

## How we will work together from now on

You will tell me what you want to change or add using plain English in this chat.

Examples of things you can ask:
- "Add a new aircraft called the MQ-4C Triton"
- "Update the number of F-35As to 72"
- "Fix the Peregrine image — it's showing the wrong plane"
- "Add a new section for ADF ranks and structure"
- "Make the bases map show more detail when zoomed"

I will then make the changes safely in the correct files.

## Adding your own images (future)

When you want to use your own photos or diagrams instead of internet images:
1. Put the image file inside the `images` folder
2. Tell me the filename
3. I will update the code to use your local image

This keeps everything self-contained and private.

## Backup note

On 28 May 2025 the original single giant `index.html` file was split into the current clean structure for easier long-term maintenance.

The old single-file version was replaced during the migration. If you ever desperately need the old giant file back, let me know and I can attempt to reconstruct it.

## Next steps

Tell me what you want to work on first. High-priority remaining items from the high-impact list:

- Finish Study Tools (Flashcards + Quiz mode with localStorage tracking)
- Expand Glossary even further with more ADF/RAAF-specific terms
- Add more weapons and adversary aircraft entries
- Deeper Space domain and Cyber domain sections (especially relevant for your three applications)
- Mobile responsiveness polish or print/PDF study sheet options

The site has grown significantly with Weapons, Adversary Air, a much larger Glossary, and robust Global Search.

Just say the word and we'll keep building.
