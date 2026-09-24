# Creative viewing session: design discussion

Status: Implemented and verified.

## Objective

Concentrate creative viewing-session coordination so returning, focus restoration, and series-position restoration can be understood and tested together. Before this refactor, coordination spanned category-gallery, work-viewer, and photography-gallery.

## Confirmed choices

- Q1 — Opening and stepping through full-size photographs creates no browser-history entries. When a work was opened from the works list, browser Back closes the work and returns to that list. The viewer's Back control and Escape continue to return from a photograph to its series before closing the work.
- Q2 — Series positions are remembered within the current loaded page, including closing and reopening a work. Reloading the page resets that memory.
- Q3 — Reopening a photo series shows its thumbnail overview at the remembered series position, rather than reopening the last full-size photograph.
- Q4 — For an externally opened work link, the viewer's Back control closes to the category's works list. Browser Back follows the real browser history and may leave the site. Do not insert an artificial works-list history entry.

## Module responsibilities

- The creative viewing module owns selected-work URL coordination, ownership of the history entry created by opening a work, viewer lifecycle, and return-to-works behavior. The works list crosses this seam to open a work without coordinating those rules itself.
- Photo selection, stepping, return-to-series behavior, and thumbnail focus restoration stay together inside the viewing module. The outer viewer no longer queries another module's private thumbnail markup through a selector.
- Series-position memory belongs to the creative viewing module and lasts for the current loaded page. Remember each work separately; preserve it across closing a work and client-side navigation, and reset it on reload.
- Thumbnail loading, full-photo loading, and video playback remain internal implementation responsibilities. Preserve existing loading, retry, placeholder, lazy-loading, and media-source behavior.
- Keep a single owner for each state and cleanup operation. A thin forwarding hook that leaves callers coordinating history, focus, and scrolling would not achieve the intended depth.

## Interface and test surface

The external interface represents opening a creative work and returning to the works list. Photo navigation and restoration are internal to that viewing session. Concrete exports and file placement are implementation choices; callers must not depend on thumbnail markup, internal photo indexes, or restoration timing.

Browser tests exercise the same seam as visitors through work links, viewer controls, Escape, browser history, URL, focus, and scroll position. No generic history, modal, persistence, or playback adapter is needed for this change.

## Acceptance scenarios

1. Opening a work from its category creates one history entry. Opening or stepping through full-size photographs creates none; browser Back returns directly to the category, and Forward reopens the work.
2. From a full-size photograph, the viewer's Back control or Escape returns to the series overview, restores its scroll position, and focuses the thumbnail corresponding to the photograph just viewed. Returning again closes the work and restores focus to the opening work link when it is present.
3. Reopening a series in the same loaded page shows the overview at its remembered position. Positions for different works remain independent; a full reload resets them.
4. A direct work link opens without a preceding category visit. Closing with the viewer's control stays in its category; browser Back follows the actual previous entry without synthesizing a category visit.
5. Closing or navigating away releases scroll locks, removes the viewer, and cleans up its effects. Existing media, keyboard, reduced-motion, and route behavior continue to pass their tests.

## Implementation and verification

Three browser scenarios were added and passed against the previous implementation before consolidation. They cover work history, series-position lifetime, and externally opened work links, and remain the viewing module's test surface alongside the existing browser tests.

After consolidation, `npm test` passed: lint, type checking, formatting, the privacy guard, 7 unit tests, the production build, and 11 browser tests. Separate Standards and Spec reviews reported no findings. The viewing implementation is in `src/features/creative/viewing-session.tsx`; photo loading and retries remain in `src/features/creative/photo-media.tsx`.

## Scope

This change is limited to creative viewing-session coordination and its tests. Creative route identities and content schemas remain as documented. Database introduction, Motion-policy consolidation, and a site-wide modal abstraction are separate work.

## Existing behavior to account for

- Work selection is represented in the URL; full-size photo selection is local viewing state.
- A direct work link opens the viewer without requiring a previous works-list visit.
- Existing browser tests cover opening a work, moving between photographs, returning focus to a thumbnail, and closing a directly opened work to its category.

The complete design was confirmed before implementation.
