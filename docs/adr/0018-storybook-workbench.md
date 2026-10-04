# 0018. How the Storybook workbench is built and tested

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

[0009](0009-docs-and-storybook.md) makes Storybook the developer workbench in `apps/storybook`, and [0010](0010-information-architecture.md) gives it the same tree as the docs site. The target state asks for a theme and mode toolbar with every theme side by side, interaction tests through the Vitest addon, no a11y violations on any story, generic patterns instead of the source's app screens, and a static build that can be served at `/storybook`. Building it raised questions those records don't answer:

- which theme and mode the a11y check runs in
- where the story tests run, given they need a real browser
- what to do where axe can't see why a story is accessible
- how the tree stays on the 0010 structure
- how to show that the build works under `/storybook` without deploying it

## Decision

**The app**

- `apps/storybook` is the private package `@mitcsutt/kiln-storybook`. It loads the stories co-located with `ui` and `forms` source (`<Name>.stories.tsx`) and holds only two kinds of page of its own: a short Introduction and one short page per `Tooling` node, so the tree has every 0010 node. Long-form prose stays on the docs site.
- The toolbar offers Paper, Monograph, Ledger and Fiesta, plus "All themes, side by side", which renders the story once per theme in its own `ThemeScope`. Mode is light, dark or system. The canvas starts in Paper, light: the default a consumer gets with no theme set. The source started in its own dark theme.
- The preview uses the CSS Module class names the published package uses (`kiln-<file>__<local>`), so the workbench renders what a consumer gets.

**Tests**

- Every story is a test, through `@storybook/addon-vitest` in Vitest browser mode on Playwright's Chromium: it must render, its `play` function must pass, and axe must find no violations (`parameters.a11y.test: 'error'`).
- The a11y check runs in every built-in theme and both modes, not only the default. `STORYBOOK_THEME` and `STORYBOOK_MODE` set the starting globals, and CI runs the story tests as a matrix of the four themes in light and dark. Each combination passed with no violations when this was written, so the matrix keeps that true.
- The story tests are `pnpm test:storybook`, a task of their own, not part of `pnpm test`. They need a browser, which the package test jobs don't install. The jsdom unit tests in each package stay the behaviour suite. The `play` functions cover what only a browser shows: portals, focus returning to a trigger, hidden steps, and real keyboard handling.
- Interactive components carry `play` functions on their stories: every overlay opens and closes with focus returned, and the tabs, accordion, stepped form, repeater, conditional fields, every forms hook, and the combobox, password, number, tags, rating, switch and segmented inputs are driven through their main interaction.
- `tree.test.ts` (a Node project in the same Vitest config) holds the 0010 tree and fails when a title sits outside it, when a ui or forms title doesn't follow its source folder, or when a component's stories have no `Playground`.

**Accessibility exceptions**

Two kinds of story turn off axe rules, scoped to those stories, with the reason beside them. Nothing else is excepted.

- The forms parity stories (every story built with `parityStory`, which applies `parityParameters`) render the same form twice by design, so the landmarks inside the two copies share names. They turn off `landmark-unique`, a best-practice rule rather than a WCAG one.
- The always-open Select story shows a modal list: Radix hides the rest of the page with `aria-hidden` and traps focus in the list, and arrow keys move through it. axe sees a hidden focusable trigger and a scrolling region with no tab stop, but not the trap. It turns off `aria-hidden-focus` and `scrollable-region-focusable`.

**Content**

- Foundations follow the 0010 nodes: Tokens (the contract read from Paper's own rule, plus shape and depth), Colour, Type, Spacing, Motion and Theming. Theming includes a small consumer-defined theme, to show a custom name working and a partial theme falling back to Paper.
- `UI/Themes` has a specimen per built-in theme. `UI/Patterns` has generic Dashboard, Settings and Checkout screens built only from library components. They replace the source's Budget, PortfolioHome and Sweepstake patterns, which were never ported (0015).
- `Forms/Hooks` has a story per exported hook.

**Static build**

- Storybook's build uses relative URLs, and the preview's Vite `base` is `./`, so the output works under any path. `check:static` serves the build at `/storybook/` only and loads a story in Chromium. Any 4xx/5xx, failed request or page error fails it. CI runs it after building Storybook on its own. Nothing is deployed (target state, out of scope).

## Consequences

- An axe violation in any theme or mode fails CI, so a token change that breaks contrast in one preset is caught on the pull request.
- The theme × mode matrix is eight CI jobs of about a minute of tests each. If that becomes a cost, the combinations can run in one job one after another.
- The 0010 tree is written down in `apps/storybook/tree.test.ts`. The docs site needs the same tree, so it should move to a shared manifest that both the docs sidebar and this test read. That's left for the docs site to pick up.
- A new interactive component should get a `play` function on a story, and a new component must have a `Playground`, or the tree test fails.
