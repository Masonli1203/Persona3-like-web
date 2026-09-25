# Feature structure migration

Status: Implemented and verified.
Baseline: 5191423 (validated Creative routing and project references).

## Scope and acceptance

- Organize dedicated code and styles under features/creative, space-configurator, navigation, home, projects, and interface-study.
- Keep editable portfolio content in src/data; separate Creative catalog behavior from content.
- Keep app responsible for routes, layouts, metadata, and page composition. Feature code must not import from app.
- Place shared layout and UI components under components/layout and components/ui. Keep fonts with their licenses under assets/fonts.
- Preserve public URLs, appearance, dynamic loading, keyboard behavior, motion preferences, and all approved viewing-session behavior.
- Update imports, tests, scripts, and documentation. Keep tests in the existing tests directory. Do not introduce a database, new UI behavior, or a generic module framework.
- Verify type checking between batches and run the complete npm test suite before completing the migration.

## Path map

| Before                                                          | After                                                                                                        |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------ |
| `src/components/creative-gallery.tsx`                           | `src/features/creative/category-menu.tsx`                                                                    |
| `src/components/media/MuxVideoPlayer.tsx`                       | `src/features/creative/mux-video-player.tsx`                                                                 |
| `src/components/creative/category-gallery.tsx`                  | `src/features/creative/category-gallery.tsx`                                                                 |
| `src/components/creative/category-menu.module.css`              | `src/features/creative/category-menu.module.css`                                                             |
| `src/components/creative/creative-visual.tsx`                   | `src/features/creative/creative-visual.tsx`                                                                  |
| `src/components/creative/creative.module.css`                   | `src/features/creative/creative.module.css`                                                                  |
| `src/components/creative/photo-media.tsx`                       | `src/features/creative/photo-media.tsx`                                                                      |
| `src/components/creative/viewing-session.tsx`                   | `src/features/creative/viewing-session.tsx`                                                                  |
| `src/lib/alcove-config.ts`                                      | `src/features/space-configurator/alcove-config.ts`                                                           |
| `src/components/alcove/alcove-configurator.tsx`                 | `src/features/space-configurator/alcove-configurator.tsx`                                                    |
| `src/components/alcove/alcove-materials.ts`                     | `src/features/space-configurator/alcove-materials.ts`                                                        |
| `src/components/alcove/alcove-scene.ts`                         | `src/features/space-configurator/alcove-scene.ts`                                                            |
| `src/components/alcove/alcove.module.css`                       | `src/features/space-configurator/alcove.module.css`                                                          |
| `src/components/page-transition.tsx`                            | `src/features/navigation/page-transition.tsx`                                                                |
| `src/components/transition-clock.tsx`                           | `src/features/navigation/transition-clock.tsx`                                                               |
| `src/components/circle-overlay.tsx`                             | `src/features/navigation/circle-overlay.tsx`                                                                 |
| `src/components/glass-geometry.ts`                              | `src/features/navigation/glass-geometry.ts`                                                                  |
| `src/components/glass-sprites.ts`                               | `src/features/navigation/glass-sprites.ts`                                                                   |
| `src/components/press-feedback.ts`                              | `src/features/navigation/press-feedback.ts`                                                                  |
| `src/components/ink-cursor.tsx`                                 | `src/features/navigation/ink-cursor.tsx`                                                                     |
| `src/components/chapter-navigation.tsx`                         | `src/features/navigation/chapter-navigation.tsx`                                                             |
| `src/app/transitions.css`                                       | `src/features/navigation/transitions.css`                                                                    |
| `src/components/home-prototype.tsx`                             | `src/features/home/home-page.tsx`                                                                            |
| `src/components/project-index.tsx`                              | `src/features/projects/project-index.tsx`                                                                    |
| `src/components/case-contents-dock.tsx`                         | `src/features/projects/case-contents-dock.tsx`                                                               |
| `src/components/persona-press-demo.tsx`                         | `src/features/interface-study/interface-study.tsx`                                                           |
| `src/app/(modules)/projects/interface-study/persona.module.css` | `src/features/interface-study/interface-study.module.css`                                                    |
| `src/app/(modules)/projects/case-study.css`                     | `src/features/projects/case-study.css`                                                                       |
| `src/components/module-shell.tsx`                               | `src/components/layout/chapter-shell.tsx`                                                                    |
| `src/app/(modules)/modules.css`                                 | `src/components/layout/chapters.css`                                                                         |
| `src/components/module-parts.tsx`                               | `src/components/ui/section-heading.tsx`                                                                      |
| `src/components/media-focus.tsx`                                | `src/components/ui/media-focus.tsx`                                                                          |
| `src/components/expandable-image.tsx`                           | `src/components/ui/expandable-image.tsx`                                                                     |
| `src/data/works.ts`                                             | `src/data/projects.ts`                                                                                       |
| `src/app/fonts/anton-OFL.txt`                                   | `src/assets/fonts/anton-OFL.txt`                                                                             |
| `src/app/fonts/anton-regular.ttf`                               | `src/assets/fonts/anton-regular.ttf`                                                                         |
| `src/app/fonts/ibm-plex-mono-latin-500.woff2`                   | `src/assets/fonts/ibm-plex-mono-latin-500.woff2`                                                             |
| `src/app/fonts/ibm-plex-mono-latin-600.woff2`                   | `src/assets/fonts/ibm-plex-mono-latin-600.woff2`                                                             |
| `src/app/fonts/OFL.txt`                                         | `src/assets/fonts/OFL.txt`                                                                                   |
| `src/app/fonts/README.md`                                       | `src/assets/fonts/README.md`                                                                                 |
| `src/app/fonts/sources.json`                                    | `src/assets/fonts/sources.json`                                                                              |
| `src/data/creativeProjects.ts`                                  | Content and types: `src/data/creative.ts`; catalog: `src/features/creative/catalog.ts`                       |
| `src/components/module-parts.tsx`                               | Split heading and media placeholder into `src/components/ui/section-heading.tsx` and `media-placeholder.tsx` |

The project lookup moves from the renamed data file into features/projects/catalog.ts; project content and IDs remain in data/projects.ts. Existing browser scenarios remain the behavioral contract.

## Verification

`npm test` passed lint, type checking, formatting, privacy checks, 13 unit tests, the production build, and 17 browser tests. `npm run preview:alcove` regenerated the cover at its original path with an unchanged content hash. The migration preserves stylesheet and font contents. Separate Standards and Spec reviews found a preview output-path regression; the trailing directory slash was restored and rechecked before completion.
