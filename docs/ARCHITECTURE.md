# Architecture

The app uses one root layout and a shared `PageTransitionProvider`. Index has its own composition; the three chapter routes share `ModuleShell` through the `(modules)` route group.

## Navigation and effects

`TransitionLink` routes known portfolio paths through the provider. Index-to-chapter navigation runs the clock, swaps the route while covered, then reveals the page through dissolving glass fragments. Chapter-to-chapter navigation runs a circular cover and reveal centered on the chosen chapter button. Returning to Index and browser history remain direct.

The circle reveal duration matches the actual visible cover duration. A navigation guard prevents overlapping transitions. Route content is temporarily inert while an overlay is active, and focus moves to the incoming main content after completion. A recovery screen is available if navigation takes too long.

The glass effect prepares canvas sprites from one complete SVG clock surface. Each fragment then animates as a composited element. This avoids repeatedly drawing the full clock for every fragment on every frame.

## Persistent cursor

`InkCursor` is mounted once inside the shared provider, beside the route stage and overlays. Keeping it outside route content preserves its motion values and event listeners when pages change.

It activates only for a fine mouse pointer with motion enabled. Native cursor hiding begins only after a mouse position is known. Keyboard use, window blur, leaving the document, reduced-motion preferences, and the Motion switch restore the appropriate fallback. The visual layer does not intercept clicks and sits above transition overlays.

## Responsive layout

The root type size grows with viewport width rather than being capped by window height. Shared type tokens keep labels and body copy readable. `scrollbar-gutter: stable` reserves scrollbar space, so temporary transition scroll locks do not squeeze the layout.

The desktop homepage artwork is intentionally separate from portrait/mobile background rules. Chapter pages share concise headings and a navigation dock that appears after the main navigation leaves the viewport.

## Data boundaries

- `site.ts`: shared identity and metadata.
- `profile.ts`: structured profile and optional contact links.
- `sections.ts`: chapter summaries and homepage previews.
- `works.ts`: project records with stable IDs, separate display numbers, shared titles, and route links. `getProject(id)` resolves typed references from About and detail pages; the index uses the same records. About keeps its own medium and summary, while each detail page owns its description, body, and interactive demo. Detail page headings and metadata derive their title from the shared record.
- `creativeProjects.ts`: categories, media sources, photo series, and the validated `creativeCatalog` interface. It owns category/work lookup, entry paths, viewer links, route resolution, and static route parameters. Catalog construction rejects duplicate identities, unknown categories, invalid path segments, and collisions between category and work routes. Callers do not filter raw content or reconstruct these URLs.

Creative category pages render a client gallery inside Suspense. The route page and metadata use the same catalog resolver; existing work entry paths redirect to the catalog's category viewer link. Unknown paths return 404, while missing or invalid work queries leave the category list visible. Photography keeps its namespaced entry paths; non-photography entry slugs share one namespace with category IDs.

The `viewing-session` module owns changes to work selection in the URL query, the history entry created when opening a work, the native dialog, and photo navigation. It uses the catalog to look up the selected work and generate viewer links. The category gallery renders work links through that module and only observes whether a viewer is open to suppress previews.

The same module owns the photo overview and its thumbnail references, so returning restores scroll and focus without querying another module's private markup. Series positions are kept separately for each work during the current loaded page and reset on reload; reopening a series shows its overview. Browser Back follows real history, while the viewer's Back control closes a directly opened work to its category without inserting a synthetic history entry. Photo loading and retry behavior live in the internal `photo-media` module. See [the browsing glossary](../CONTEXT.md) and [the confirmed viewing-session design](design/creative-viewing-session.md).

Three.js loads when the configurator nears the viewport; Mux Player loads only for configured playback.

No secrets or external services are required for the default starter. The optional Mux management client is server-only. Public playback IDs belong in media configuration only after the template is personalized.
