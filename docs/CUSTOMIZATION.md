# Customization

## Identity

Edit `src/data/site.ts` first. Its name and initials drive the homepage, shared navigation, transition labels, and page metadata. Keep the two name lines short and check both desktop and mobile layouts. The homepage artwork slot accepts a local image path; the bundled abstract SVG contains no portrait.

Edit `src/data/profile.ts` for profile details. Set `email` to your address and `cv` to a public PDF path only when ready; blank values hide both links. Replace `portrait` with media you own. Update the introduction heading in the About page if your discipline differs from the example.

## Creative media

Edit `src/data/creativeProjects.ts`. Category IDs determine routes. Each video entry can have `coverImage`, `videoSrc`, `previewVideo`, and a public `muxPlaybackId`. A playback ID takes precedence over a local video. Without either, the viewer shows a placeholder. No real playback IDs ship with this repository.

Place local videos under `public/media/` and reference them with paths such as `/media/film.mp4`. Preview clips are optional: they play only on supported pointer devices with motion enabled and stop when hidden. Gallery entries need `src`, `thumbnail`, `alt`, `width`, and `height`. The tiny SVG placeholders reuse their original files as thumbnails; for real photographs, generate smaller thumbnails with matching proportions.

Category pages use `/creative/<category>`. Opening a work adds `?work=<slug>` for a shareable dialog. Canonical work routes redirect to that viewer; photography work routes include `/creative/photography/<slug>`.

Public Mux playback does not need server credentials. Optional management credentials are documented in `.env.example`; put actual values in a local ignored environment file. The management client stays behind `server-only`. Never put tokens in data files or NEXT_PUBLIC variables. `npm run check:mux` performs an optional connection check. Adding Mux playback introduces external service requests only for configured videos.

## Projects

Edit `src/data/works.ts` and add a route under `src/app/(modules)/projects/`. The sample project demonstrates expandable images and a floating contents dock. Interface Study isolates the press/transition interaction. Space Configurator demonstrates procedural geometry, dimensions, finishes, and accessories without claiming any client history.

The configurator uses `src/lib/alcove-config.ts` and `src/components/alcove/`. Its prices are demonstration values. After changing geometry, run `npm run preview:alcove` to refresh its SVG preview.

## Styling and verification

Shared styles live in `src/app/globals.css`, `src/app/transitions.css`, and `src/app/(modules)/modules.css`. Creative and configurator styles use CSS modules. Fonts are local with license files beside them.

Run `npm run check`, `npm run build`, and `npm run test:e2e` before publishing. The starter privacy guard intentionally rejects populated email/playback IDs and raster media in src/public. Adapt that guard when adding your own content to a personal fork, while retaining secret and private-file checks. Do not weaken it in contributions to this generic starter.
