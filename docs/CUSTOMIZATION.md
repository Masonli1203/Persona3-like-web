# Customization / 修改说明

## Identity

Edit `src/data/site.ts` first. The homepage name, wordmark, footer, module headers, About profile, clock label, and page metadata read from this file.

`nameLines` supplies the two large homepage lines; keep them short enough to fit the identity column. `initials` should be two or three characters, since it also appears in the compact clock header. Check narrow phones and wide desktops after replacing either.

The About education/experience entries are intentionally generic. Edit their structure in `src/app/(modules)/about/page.tsx` when you add real information. The CV button is disabled until you replace it with a real download link.

个人身份主要修改 `site.ts`；经历条目和 CV 链接在 About 页面中修改。较长的名字需要检查窄屏排版。

## Chapters and work

- `src/data/sections.ts`: homepage chapter labels, hover headlines, and descriptions.
- `src/data/works.ts`: creative works, categories, and project details.
- The creative filter labels live in `src/components/creative-gallery.tsx`; keep them consistent with work categories.
- Project selection supports mouse hover, keyboard focus, and clicking.

The three route IDs are intentionally fixed to `creative`, `projects`, and `about`. Adding a fourth route also requires updating `chapters` in `page-transition.tsx` and the chapter navigation/layout; it is not a data-only change.

## Artwork and media

The bundled abstract SVG is a generic placeholder and is included under the project MIT license. Replace it with your own artwork, then change `site.heroArtwork` to a path below `public/`.

- The default canvas is 1672 × 941.
- Keep the left identity area and right navigation area visually quiet.
- Desktop artwork position, aspect handling, and reverse parallax are controlled in `globals.css` and `home-prototype.tsx`.
- Mobile/portrait backgrounds remain geometric by design.
- `MediaPlaceholder` is the reusable slot for future images and video players.
- No video service is configured. Store large video assets in suitable media hosting rather than Git history.

背景图只在桌面横屏使用。更换图片后检查文字是否遮挡主体，以及左右区域的对比度。项目和作品媒体可以从 `MediaPlaceholder` 组件逐步替换。

## Palette and type

Color variables live at the top of `src/app/globals.css`. `--text-micro`, `--text-small`, `--text-body`, and `--text-lead` are the shared fluid type scale. Avoid adding fixed tiny font sizes for metadata or squeezing text to fit: prefer wrapping or additional space.

The clock's green phase and module backdrop share the midnight color variables. The chapter circle palette lives in `src/app/transitions.css`.

## Motion

- Homepage: the `spring` and `buttonSpring` settings plus local transforms in `home-prototype.tsx`.
- Cursor: `ink-cursor.tsx`; the pointer follows immediately and only the decorative strokes trail.
- Clock/fragment animation: `transition-clock.tsx`, `glass-geometry.ts`, `glass-sprites.ts`, and `transitions.css`.
- Routing and phase timing: `page-transition.tsx`.
- Circle rendering: `circle-overlay.tsx`.

The Motion switch is shared during the current app session. Reduced-motion preferences and coarse/touch input retain their appropriate fallbacks. The switch is not stored across a full browser reload.

Always check an Index-to-chapter transition, a chapter-to-chapter transition, returning to Index, browser history, keyboard navigation, and reduced motion after editing the shared transition code.

## Browser tests

Run a production build before `npm run test:e2e`. Playwright uses its installed Chromium by default. For local troubleshooting you may set `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing compatible Chromium browser; CI does not require that override.
