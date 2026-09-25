# Customization

## Identity

Edit `src/data/site.ts` first. Its name and initials drive the homepage, shared navigation, transition labels, and page metadata. Keep the two name lines short and check both desktop and mobile layouts. The homepage artwork slot accepts a local image path; the bundled abstract SVG contains no portrait.

Edit `src/data/profile.ts` for profile details. Set `email` to your address and `cv` to a public PDF path only when ready; blank values hide both links. Replace `portrait` with media you own. Update the introduction heading in the About page if your discipline differs from the example.

## Creative media

Edit `src/data/creative.ts`. Category IDs determine routes. Each video entry can have `coverImage`, `videoSrc`, `previewVideo`, and a public `muxPlaybackId`. A playback ID takes precedence over a local video. Without either, the viewer shows a placeholder. No real playback IDs ship with this repository.

Place local videos under `public/media/` and reference them with paths such as `/media/film.mp4`. Preview clips are optional: they play only on supported pointer devices with motion enabled and stop when hidden. Gallery entries need `src`, `thumbnail`, `alt`, `width`, and `height`. The tiny SVG placeholders reuse their original files as thumbnails; for real photographs, generate smaller thumbnails with matching proportions.

Category pages use `/creative/<category>`. Opening a work adds `?work=<slug>` for a shareable dialog. Canonical work routes redirect to that viewer; photography work routes include `/creative/photography/<slug>`.

`src/features/creative/catalog.ts` exports `creativeCatalog` for listing works, finding a work within its category, generating links, resolving route segments, and generating static parameters. Use this interface in pages and components instead of filtering content or assembling URLs. Edit the category and work arrays in `src/data/creative.ts` to change content; the catalog validates them when loaded, including during the production build.

Slugs must be nonempty single path segments, excluding `.` and `..`, slashes, backslashes, and control characters. Each category requires unique work slugs. Non-photography work slugs also must be unique across categories and must not equal any category ID, since these share `/creative/<slug>`. Photography slugs have a separate `/creative/photography/<slug>` namespace. Link generators encode punctuation and Unicode; store the original, unencoded slug in content. Invalid `work` query values leave the category list visible; unknown entry paths return 404.

Public Mux playback does not need server credentials. Optional management credentials are documented in `.env.example`; put actual values in a local ignored environment file. The management client stays behind `server-only`. Never put tokens in data files or NEXT_PUBLIC variables. `npm run check:mux` performs an optional connection check. Adding Mux playback introduces external service requests only for configured videos.

## Projects

Edit `src/data/projects.ts` and add a route under `src/app/(modules)/projects/`. The sample project demonstrates expandable images and a floating contents dock. Interface Study isolates the press/transition interaction. Space Configurator demonstrates procedural geometry, dimensions, finishes, and accessories without claiming any client history.

Each project has a stable `id`, a separate display `number`, and one shared `title`. Keep the ID when renaming, reordering, or renumbering a project. `caseStudyHref` is optional: omit it for entries without a detail page. For a route change, update this link and move the corresponding route folder; the ID stays the same.

About's `profile.projects` entries use `projectId` instead of copying a name or link. Choose an ID from `projects.ts` and keep the About-specific `medium` and `description` in the profile. Detail pages call `getProject(id)` from `src/features/projects/catalog.ts` for their heading and metadata title, while keeping their own description, narrative, and demo. Type checking rejects unknown references, and the project tests check unique IDs and that linked detail routes exist.

The configurator's UI, scene, materials, styles, and pure calculations live together in `src/features/space-configurator/`. Its prices are demonstration values. After changing geometry, run `npm run preview:alcove` to refresh its SVG preview. The interface demo and its styles live in `src/features/interface-study/`.

## Styling and verification

Shared styles live in `src/app/globals.css`, `src/features/navigation/transitions.css`, and `src/components/layout/chapters.css`. Feature styles live beside their code, including Creative and configurator CSS modules and the shared project case-study stylesheet. Fonts and their licenses are in `src/assets/fonts/`.

Run `npm run check`, `npm run build`, and `npm run test:e2e` before publishing. The starter privacy guard intentionally rejects populated email/playback IDs and raster media in src/public. Adapt that guard when adding your own content to a personal fork, while retaining secret and private-file checks. Do not weaken it in contributions to this generic starter.
