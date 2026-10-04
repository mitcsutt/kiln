# Kiln

Kiln is a themeable React design system and form library, published to npm under the `@mitcsutt` scope.

> **Status: planning.** This repository holds only the plan right now. Nothing is built yet. The intended end state is described in [`docs/target-state.md`](docs/target-state.md), and the reasoning behind each decision is in [`docs/adr/`](docs/adr/).

## What Kiln is for

I kept rebuilding the same components, form plumbing and lint configs in every project. Kiln pulls them into one place, so any new project can install them, theme them and get going.

It starts with five packages:

| Package | What it is |
|---|---|
| `@mitcsutt/kiln-ui` | Themeable components on Radix primitives, with plain CSS, design tokens, and a default theme plus opt-in presets |
| `@mitcsutt/kiln-forms` | A form library on TanStack Form. Forms can be written as components or described as JSON schemas, and both render through `kiln-ui`. |
| `@mitcsutt/kiln-eslint-config` | A shared flat ESLint config |
| `@mitcsutt/kiln-prettier-config` | A shared Prettier config |
| `@mitcsutt/kiln-tsconfig` | Shared TypeScript presets |

More general utilities will follow as `@mitcsutt/kiln-*` packages.

## Ideas it's built on

- **Themes are data, components are structure.** A component never knows which theme it's in. A theme is one CSS file of tokens. Kiln ships a neutral default (`paper`) and three presets (`monograph`, `ledger`, `fiesta`), and anyone can write their own.
- **Props, not styles.** Layout and intent are typed props (`gap={5}`, `tone="critical"`), not utility classes or inline styles.
- **Durable by default.** Components forward refs, work on React 18 and 19, render on the server, and are complete for keyboard and screen-reader users.
- **Docs for people and agents.** A docs site for people, Storybook for development, and agent skills shipped inside each package via [TanStack Intent](https://tanstack.com/intent), so coding agents in a consumer's project know how to use Kiln correctly.

## Licence

[MIT](LICENSE)
