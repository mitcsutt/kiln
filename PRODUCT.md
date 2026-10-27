# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Users

- **Primary: the maintainer.** Kiln exists because the same components, form plumbing and lint configs kept getting rebuilt across projects. The main job is starting a new React project by installing the packages, picking (or writing) a theme, and building straight away, with a look that is reusable and themed to the maintainer's own taste.
- **Secondary: outside React developers.** The packages are public on npm and the repo is public under MIT. Outside developers are welcome, and the docs, changelogs and packages are written for them, but their needs don't outrank the maintainer's.
- **Coding agents in consumer projects** use Kiln through the skills shipped in the packages, `llms.txt`, and the Markdown version of every docs page. They serve the developer who runs them.

## Product Purpose

Kiln is a monorepo of published `@mitcsutt/kiln-*` packages: a themeable React design system (`kiln-ui`), a form library on TanStack Form (`kiln-forms`), drag and drop (`kiln-dnd`), server-rendered charts (`kiln-charts`), an app-structure ESLint preset (`kiln-structure`), and shared ESLint, Prettier and TypeScript configs. It also holds the public docs site (`apps/docs`, Fumadocs, deployed from `main`) and a Storybook workbench (`apps/storybook`, local only for now).

Success: a new project goes from install to a themed, accessible, working UI without rebuilding anything Kiln already covers.

## Positioning

- **Themes with real personality, each for a job.** One component set whose whole look (colour, type, shape, density, depth, motion) comes from a theme of tokens. Each built-in theme has a goal, the kind of product to choose it for, and draws one idea from a subject to reach it ([ADR 0045](docs/adr/0045-four-themes-each-with-a-goal.md)):
  - **Paper** (the default): products that shouldn't have a personality yet, or must sit under someone else's brand.
  - **Ledger**: numbers people have to trust. Used by the maintainer's budget app.
  - **Flightdeck**: operating something live; dark-first. Used by the maintainer's site.
  - **Riso**: products for people rather than operators; warm and playful.
  - Monograph and Fiesta are deprecated and leave in the next minor release. Anyone can still write their own theme.
- **Agent-ready by design.** Agent skills ship inside the packages, generated from the docs pages, alongside `llms.txt` and per-page Markdown.
- **One integrated family.** UI, forms (written as components or described as JSON schemas), drag and drop, and charts share one token contract, one keyboard model and one announcer.
- **Anti-slop standards.** Design rules against the median AI-generated look are binding and enforced by lint rules and tests where possible (`DESIGN.md`, ADR 0012, ADR 0030).

## Operating Context

- Consumers install from npm, load `@mitcsutt/kiln-ui/styles.css` once, and wrap the app in `ThemeProvider`.
- Developers learn the API from the docs site: generated component, field, layout and hook pages built from TSDoc and docs-tagged stories, plus MDX guides.
- Contributors work in Storybook, where every story runs as a render, interaction and axe test in every theme and mode.
- Decisions are recorded as ADRs in `docs/adr/`; releases go through Changesets and the release workflow.

## Capabilities and Constraints

- Pre-1.0: every package is `0.x`, so a minor release can still break. `1.0.0` comes once the token contract is frozen.
- Components forward refs, spread native props, work on React 18 and 19, render on the server, and respect `prefers-reduced-motion`.
- Props, not styles: layout and intent are typed props; `className` is an escape hatch.
- Everything is written as if public: no secrets, internal URLs or private project details.
- Undecided: when Storybook is deployed publicly.

## Brand Commitments

- Name: Kiln, published under the `@mitcsutt` npm scope.
- Voice: plain, first-person where the maintainer speaks (the README), direct and specific; no marketing hype.
- `DESIGN.md` is the binding visual contract for every component, theme, story and docs page.

## Evidence on Hand

- Live docs site with examples for every export; the packages on npm; CI covering lint, typecheck, tests, React 18, Storybook browser tests, link checks, package checks and size budgets.
- No testimonials, adoption numbers, case studies or third-party users are on record. Don't invent any.

## Product Principles

1. Serve the maintainer's next project first; public polish follows from that, not the other way round.
2. Themes are data, components are structure: a new look is a token file, never a component change.
3. Specific beats safe: every theme and surface has one idea from its subject, everything else quiet.
4. Docs serve people and agents equally well, from one source.
5. Durable by default: accessible, server-rendered, React 18 and 19, proven by tests rather than asserted.

## Accessibility & Inclusion

WCAG AA, as evidenced in the repo rather than a stated policy: token contrast pairs are specified for AA text and 3:1 non-text contrast (WCAG 1.4.11), every story runs axe in every theme and mode, components are keyboard- and screen-reader-complete, and motion respects `prefers-reduced-motion`.
