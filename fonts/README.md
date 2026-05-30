# Self-hosted Fonts

## Rajdhani

This folder contains the self-hosted Rajdhani font files (WOFF2 format) to avoid loading from Google Fonts.

### Download Instructions

1. Go to: https://gwfh.mranftl.com/fonts/rajdhani
2. Select these weights only:
   - Regular (400)
   - Medium (500)
   - SemiBold (600)
   - Bold (700)
3. Choose "Modern Browsers" (WOFF2)
4. Download the zip.
5. Extract and place these four files into this folder:

   - rajdhani-v17-latin-regular.woff2
   - rajdhani-v17-latin-500.woff2
   - rajdhani-v17-latin-600.woff2
   - rajdhani-v17-latin-700.woff2

The @font-face rules are already defined in styles.css.

This removes the external Google Fonts connection and the annoying "Glyph bbox was incorrect" warnings.
