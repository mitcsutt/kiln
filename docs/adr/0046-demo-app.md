# 0046. A demo app that uses every export

- **Status:** Accepted
- **Date:** 2026-10-27

## Context

Kiln's components are shown one at a time: in Storybook ([0018](0018-storybook-workbench.md)) and as docs stories on their own pages ([0028](0028-docs-stories.md)). Nothing shows them working together in one app, under one router, one theme provider and one set of forms. A gap between packages only shows up there: a field that can't sit in a layout, a drag source that fights a table, or a theme that reads well on a story but not across a whole screen.

[0045](0045-four-themes-each-with-a-goal.md) gave each built-in theme a goal, and a goal is easiest to judge on the kind of screen it is for. [0037](0037-app-structure.md) defined how a Kiln app is laid out, but no app in this repository used `@mitcsutt/kiln-structure` yet.

## Decision

`apps/demo` is Slipcast, a private pottery co-op app, built with Vite and TanStack Router.

- **Every component and hook is used.** `scripts/check-coverage.ts` reads each package entry's exports with the TypeScript compiler and fails when one isn't imported in `src`. That covers components and `use*` hooks, not icons or types. Kit shorthand (`<form.TextField>`) counts as the `Form…Field` export. Exports that can't be used honestly are listed in `scripts/coverage-exemptions.ts` with a reason, and the check fails when an exemption is used or no longer exported. The check runs in the app's `lint` script, so CI runs it, and in a pre-commit job when a package's `index.ts` changes. `apps/demo/AGENTS.md` tells agents the rule.
- **Each area is built for one theme**, following 0045: studio admin for Paper, the books for Ledger, the kiln room for Flightdeck, and the community pages for Riso. The app switches between all four, and `?theme=` sets the starting theme.
- **It is a consumer, not a workbench.** It imports only the public entries an app uses, and has no `style`, `className` or CSS Modules of its own. ESLint enforces both. Its folders follow `@mitcsutt/kiln-structure`, with the feature graph declared in the root ESLint config.
- **Mock data, real loading.** Fixtures sit behind short delays. Route loaders await them, and a pending component shows a skeleton. Nothing makes a request.
- **The docs site frames it.** The docs build copies `apps/demo/dist` to `public/demo-app/`, and the static export serves it at `/demo-app/`. The `/demo` page frames it, opening in the site's theme when the demo has that theme. Because the demo uses hash routing and relative asset paths, it needs no server rewrites under [0034](0034-docs-on-cloudflare-workers.md). The demo's `/demo` page is a Next route outside the content tree, so the sidebar and Storybook tree in [0010](0010-information-architecture.md) are unchanged.

## Consequences

- Adding, removing or renaming an export now means changing the demo in the same pull request. That is deliberate. The add-component, add-forms-field and add-theme-preset procedures include the step.
- The demo catches package-level problems early. A visual the components can't express shows up as a lint error, since the demo can't style its own way around it.
- The docs build depends on the demo build. `@mitcsutt/kiln-demo` is a docs dev dependency so turbo builds it first, and `pnpm dev` in the docs shows an empty frame until the demo has been built once.
- The demo's coverage is of exports, not of props or variants. Whether each use is a good one is left to review.
