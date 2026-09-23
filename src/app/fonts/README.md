# IBM Plex Mono

The user selected typography demo C at 15px on September 18, 2026.

- `ibm-plex-mono-latin-500.woff2`: Medium, used for dates and language proficiency.
- `ibm-plex-mono-latin-600.woff2`: SemiBold, used for metadata labels and navigation details.
- Files are loaded locally through `next/font/local` in `src/app/layout.tsx`.
- The Latin subset covers the site's English metadata and date punctuation. Symbols outside the subset use the browser's fallback fonts.
- Combined font payload: 30,508 bytes, before transfer overhead. Production pages make no external font requests.

Download URLs are recorded in `sources.json`. Both files use the SIL Open Font License in `OFL.txt`. The comparison demo retains its separate original font files.

## Anton

The homepage's sliced manifesto uses `anton-regular.ttf`, scoped through `next/font/local` in `home-prototype.tsx`.
Source: https://raw.githubusercontent.com/google/fonts/main/ofl/anton/Anton-Regular.ttf
License: SIL Open Font License, saved in `anton-OFL.txt` from the same directory.
