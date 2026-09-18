# Persona3-like-web

A portfolio template inspired by the visual rhythm of Persona 3: diagonal composition, oversized italic type, ink-like pointer feedback, and expressive page transitions.

[中文说明](README.zh-CN.md) · [Customization](docs/CUSTOMIZATION.md) · [Contributing](CONTRIBUTING.md) · [MIT license](LICENSE)

![Homepage preview](docs/screenshots/home.png)

[Chapter preview](docs/screenshots/creative.png) · [Mobile preview](docs/screenshots/mobile.png)

## What is included

- **Index:** mouse parallax, title tilt, magnetic links, comic-style hover expansion, and live section previews.
- **Creative:** filterable work cards and expandable study notes.
- **Projects:** an interactive project list and preview panel.
- **About:** editable profile, background, and interests.
- **Shared cursor:** instant pointer tracking, trailing ink strokes, and interactive hover feedback across all routes.
- **Transitions:** an 11-to-12 clock and dissolving glass effect when entering a chapter from Index; circular wipes between chapters.
- **Responsive behavior:** fluid typography, stable scrollbar space, keyboard focus, touch layouts, and reduced-motion support.

Built with **Next.js App Router, TypeScript, Tailwind CSS, and Framer Motion**. Animations use CSS, SVG, and small canvas sprites; there is no Three.js or WebGL dependency.

This is a frontend template. The example works, media, biography, and CV are placeholders. It has no authentication, CMS, analytics, video service, or backend integration.

## Run locally

Use Node.js **24** and npm. Node.js 22 is also allowed by the package requirements. No environment variables or API keys are needed.

```sh
git clone https://github.com/Masonli1203/Persona3-like-web.git
cd Persona3-like-web
npm ci
npm run dev
```

Open [http://127.0.0.1:3000](http://127.0.0.1:3000).

If you want your own independent portfolio, choose **Use this template** on GitHub. If you want to help develop this shared project, **fork it and submit a pull request** instead; a template copy starts a separate project history. See [GitHub's template documentation](https://docs.github.com/en/repositories/creating-and-managing-repositories/creating-a-template-repository).

## Make it yours

Start with these files:

| File                                 | What to change                                                |
| ------------------------------------ | ------------------------------------------------------------- |
| `src/data/site.ts`                   | Name, initials, title, biography, interests, and artwork path |
| `src/data/sections.ts`               | Chapter labels and homepage hover descriptions                |
| `src/data/works.ts`                  | Creative work and project examples                            |
| `public/images/hero-placeholder.svg` | Abstract desktop artwork placeholder                          |
| `src/app/globals.css`                | Colors, typography, homepage layout, pointer feedback         |
| `src/app/(modules)/modules.css`      | Chapter layout and controls                                   |
| `src/app/transitions.css`            | Transition appearance and timing                              |

The default text is generic. Personal portraits, photographs, local design archives, credentials, and machine-specific verification files from the original portfolio are excluded.

The desktop artwork slot currently uses a **1672 × 941** canvas, with the main artwork between the left identity column and the right navigation. Portrait/mobile layouts use the existing geometric background. See [customization notes](docs/CUSTOMIZATION.md) before replacing the artwork or using a long name.

## Checks and tests

```sh
npm run check
npm run build
npx playwright install chromium
npm run test:e2e
```

The browser tests start a local **production** server on port **3100**, so build first. On Linux, `npx playwright install --with-deps chromium` also installs browser system dependencies. The development server on port 3000 can remain open.

| Command            | Purpose                                                        |
| ------------------ | -------------------------------------------------------------- |
| `npm run dev`      | Local development                                              |
| `npm run build`    | Production build only                                          |
| `npm run start`    | Serve a completed build locally                                |
| `npm run check`    | Lint, TypeScript, and formatting checks                        |
| `npm run format`   | Format source and documentation                                |
| `npm run test:e2e` | Browser navigation, interaction, cursor, and responsive checks |
| `npm test`         | Checks, build, and browser tests together                      |

GitHub Actions runs the checks, build, and browser tests for pushes and pull requests. **No deployment workflow or hosting integration is included.**

## Project map

```text
src/
  app/
    page.tsx                 # Index
    (modules)/               # Creative, Projects, About
    globals.css
    transitions.css
  components/
    home-prototype.tsx
    module-shell.tsx
    page-transition.tsx      # Shared routing and transition lifecycle
    ink-cursor.tsx           # Shared cursor; mounted outside route content
    transition-clock.tsx
    circle-overlay.tsx
    glass-geometry.ts
    glass-sprites.ts
  data/                      # Editable example content
public/images/               # Generic SVG artwork
tests/                       # Playwright browser tests
docs/                        # Customization, architecture, screenshots
```

Read [architecture notes](docs/ARCHITECTURE.md) for the cursor and transition lifecycle, and [the roadmap](docs/ROADMAP.md) for possible contributions.

## License and inspiration

The code and bundled generic SVG artwork are available under the [MIT license](LICENSE). Dependency licenses remain their own.

This is an independent, unofficial project. Persona and Persona 3 are referenced as design inspiration; this repository includes no official game art, music, logos, or fonts and has no affiliation with ATLUS or SEGA. Add only media you have permission to distribute.
