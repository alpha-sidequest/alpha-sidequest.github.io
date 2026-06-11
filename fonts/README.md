Copy the rajdhani-v17-latin-*.woff2 files here (regular, 500, 600, 700) to enable the exact military font used in the design. The CSS will fall back to system sans if missing.

Steps to add the fonts (so the site never touches Google Fonts):

1. Go to https://gwfh.mranftl.com/fonts/rajdhani (Google Webfonts Helper — the easiest way to get the exact self-hosted files).

2. Keep "latin" selected (the subset the CSS uses).

3. Select these weights:
   - Regular (400)
   - Medium (500)
   - SemiBold (600)
   - Bold (700)

4. Under "Modern Browsers", choose only "WOFF2".

5. Click the big "Download" button at the bottom. You'll get a zip file.

6. Extract the zip.

7. Copy these four files into this `fonts/` folder:
   - rajdhani-v17-latin-regular.woff2
   - rajdhani-v17-latin-500.woff2
   - rajdhani-v17-latin-600.woff2
   - rajdhani-v17-latin-700.woff2

   (Rename them if the downloader gave slightly different names so they exactly match the filenames above.)

8. (Optional but recommended) Delete the other files from the zip (the .woff, the CSS snippet, etc.) — you only need the four .woff2 files.

9. Refresh your local server (or hard-refresh the browser). The 404 errors for the fonts should disappear, and the site will use the real Rajdhani font instead of falling back to system sans.

The @font-face rules in styles.css are already written to use these local files (no @import from Google Fonts at all). This keeps everything private and offline-friendly.

If you ever want to remove the custom font completely, just delete the files from this folder — the CSS already has good system font fallbacks.
