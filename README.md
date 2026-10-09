# Kiln

[![CI](https://github.com/mitcsutt/kiln/actions/workflows/ci.yml/badge.svg)](https://github.com/mitcsutt/kiln/actions/workflows/ci.yml)

Kiln is a themeable React design system and form library, published to npm under the `@mitcsutt` scope, along with the shared ESLint, Prettier and TypeScript configs it's built with.

> **Status: pre-1.0.** Every package is published to npm at `0.x`, so a minor release can still carry breaking changes. The docs site deploys from `main` to [kiln.mitchellsutton.com](https://kiln.mitchellsutton.com). Storybook isn't deployed yet, but it runs locally (see [Apps](#apps)). Releases follow [`docs/releasing.md`](docs/releasing.md), and the reasoning behind each decision is in [`docs/adr/`](docs/adr/).

## What Kiln is for

I kept rebuilding the same components, form plumbing and lint configs across projects. Kiln collects them in one place, so a new project can install them, pick a theme and start building.

## Packages

| Package                                                      | What it is                                                                                                                           | npm                                                                                                                                        |
| ------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| [`@mitcsutt/kiln-ui`](packages/ui)                           | Themeable components on Radix primitives, with plain CSS, design tokens, and a default theme plus opt-in presets                     | [![npm](https://img.shields.io/npm/v/@mitcsutt/kiln-ui?label=)](https://www.npmjs.com/package/@mitcsutt/kiln-ui)                           |
| [`@mitcsutt/kiln-forms`](packages/forms)                     | A form library on TanStack Form. Forms can be written as components or described as JSON schemas, and both render through `kiln-ui`. | [![npm](https://img.shields.io/npm/v/@mitcsutt/kiln-forms?label=)](https://www.npmjs.com/package/@mitcsutt/kiln-forms)                     |
| [`@mitcsutt/kiln-eslint-config`](packages/eslint-config)     | A shared, type-aware flat ESLint config                                                                                              | [![npm](https://img.shields.io/npm/v/@mitcsutt/kiln-eslint-config?label=)](https://www.npmjs.com/package/@mitcsutt/kiln-eslint-config)     |
| [`@mitcsutt/kiln-prettier-config`](packages/prettier-config) | A shared Prettier config                                                                                                             | [![npm](https://img.shields.io/npm/v/@mitcsutt/kiln-prettier-config?label=)](https://www.npmjs.com/package/@mitcsutt/kiln-prettier-config) |
| [`@mitcsutt/kiln-tsconfig`](packages/tsconfig)               | Shared TypeScript presets                                                                                                            | [![npm](https://img.shields.io/npm/v/@mitcsutt/kiln-tsconfig?label=)](https://www.npmjs.com/package/@mitcsutt/kiln-tsconfig)               |
| [`@mitcsutt/kiln-structure`](packages/structure)             | A recommended structure for React web apps, with an ESLint preset that enforces it                                                   | [![npm](https://img.shields.io/npm/v/@mitcsutt/kiln-structure?label=)](https://www.npmjs.com/package/@mitcsutt/kiln-structure)             |

More general utilities will follow as `@mitcsutt/kiln-*` packages.

## Apps

| App                                | What it is                                                                                                                                       | Run it locally                               |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| [`apps/docs`](apps/docs)           | The public docs site: every component, field, layout and hook with a live example, generated API tables, guides, search, and Markdown for agents | `pnpm --filter @mitcsutt/kiln-docs dev`      |
| [`apps/storybook`](apps/storybook) | The developer workbench: every ui and forms story, in every theme and mode, each one a render, interaction and a11y test                         | `pnpm --filter @mitcsutt/kiln-storybook dev` |

## Quick start

Install the UI and, if you need forms, the form library:

```sh
pnpm add @mitcsutt/kiln-ui @mitcsutt/kiln-forms
```

Load the stylesheet once and wrap the app in a theme:

```tsx
import '@mitcsutt/kiln-ui/styles.css'
import { Button, Stack, Text, ThemeProvider } from '@mitcsutt/kiln-ui'

export function App() {
  return (
    <ThemeProvider>
      <Stack gap={4}>
        <Text>Next sailing to Kelso Bay boards at berth 3.</Text>
        <Button>Book a seat</Button>
      </Stack>
    </ThemeProvider>
  )
}
```

Then let your coding agent pick up the skills both packages ship:

```sh
npx @tanstack/intent@latest install
```

For the lint, format and TypeScript configs:

```sh
pnpm add -D @mitcsutt/kiln-eslint-config @mitcsutt/kiln-prettier-config @mitcsutt/kiln-tsconfig eslint prettier typescript
```

Each package's README shows how to wire it up, and the docs site has a getting-started guide for each. To work on Kiln itself, see [CONTRIBUTING.md](CONTRIBUTING.md).

## Ideas it's built on

- **Themes are data, components are structure.** A component never knows which theme it's in. A theme is one CSS file of tokens. Kiln ships a neutral default (`paper`) and five presets (`monograph`, `ledger`, `fiesta`, `flightdeck`, `riso`), and anyone can write their own.
- **Props, not styles.** Layout and intent are typed props (`gap={5}`, `tone="critical"`), not utility classes or inline styles.
- **Durable by default.** Components forward refs, work on React 18 and 19, render on the server, and are complete for keyboard and screen-reader users.
- **Docs for people and agents.** A docs site for people, Storybook for development, and agent skills shipped inside `kiln-ui` and `kiln-forms` via [TanStack Intent](https://tanstack.com/intent), built from the docs pages, so coding agents in a consumer's project know how to use Kiln correctly.

## Links

- Docs site: [kiln.mitchellsutton.com](https://kiln.mitchellsutton.com) (run it locally with `pnpm --filter @mitcsutt/kiln-docs dev`). For agents: [`/llms.txt`](https://kiln.mitchellsutton.com/llms.txt), and any page as Markdown by adding `.md` to its URL
- Storybook: [kiln.mitchellsutton.com/storybook](https://kiln.mitchellsutton.com/storybook) (not live yet)
- [Contributing](CONTRIBUTING.md), [Security policy](SECURITY.md), [Code of Conduct](CODE_OF_CONDUCT.md)

## Licence

[MIT](LICENSE)
