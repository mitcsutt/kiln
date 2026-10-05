# @mitcsutt/kiln-ui

A themeable React component system. There's one set of components, and the theme on the root decides everything visual: colour, type, shape, density, depth and motion. Behaviour comes from [Radix](https://www.radix-ui.com/primitives) primitives; the look is plain CSS and design tokens.

## Install

```sh
pnpm add @mitcsutt/kiln-ui
```

React and React DOM 18.3 or 19 are peer dependencies. The only runtime dependency is `radix-ui`.

## Usage

Import the stylesheet once at your app root, before your own CSS, then compose screens from typed props:

```tsx
import '@mitcsutt/kiln-ui/styles.css'
import { Button, Container, Heading, Section, Stack, ThemeProvider } from '@mitcsutt/kiln-ui'

export function App() {
  return (
    <ThemeProvider>
      <Section space={9}>
        <Container width="content">
          <Stack gap={5}>
            <Heading level={1} size="display-lg">
              Maps for people in a hurry
            </Heading>
            <Button>Download the timetable</Button>
          </Stack>
        </Container>
      </Section>
    </ThemeProvider>
  )
}
```

## Themes

- **`paper`** is the default: neutral, graphite on warm paper. It's in `styles.css` and applies when no theme is set.
- **`monograph`**, **`ledger`** and **`fiesta`** are presets. Import the ones you use, and select one on the root or on any subtree:

  ```tsx
  import '@mitcsutt/kiln-ui/themes/fiesta.css'

  <ThemeProvider theme="fiesta" defaultMode="light">…</ThemeProvider>
  <ThemeScope theme="fiesta">…</ThemeScope>
  ```

- **Your own theme** is one CSS file against the token contract, selected the same way (`theme="harbour"`).

Each theme has light and dark modes (`data-mode`, or `mode`/`defaultMode` on `ThemeProvider`), and `data-density` makes any subtree denser or roomier. For SSR (or a static `index.html`) without a flash of the wrong mode, render `themeScript(theme, defaultMode)` in your document `<head>`. The mode is stored under `kiln-color-mode`; pass `storageKey` to `ThemeProvider` and `themeScript` to give each app on one origin its own key.

## Fonts

Kiln self-hosts the fonts its themes use, so there's nothing to set up: Schibsted Grotesk, Newsreader and Martian Mono come with `styles.css`, and Big Shoulders and Bricolage Grotesque come with the Fiesta preset. Browsers download a face only when something renders in it. All five are licensed under the SIL Open Font License 1.1, and the licences ship in `dist/assets/fonts/licenses/`. A custom theme loads its own fonts.

## For coding agents

The package ships agent skills in `skills/`, built from the docs pages: setting up and theming, composing layout, writing a custom theme, and the design rules. They're versioned with the code, so they match the version you've installed. Run this in your project, and [TanStack Intent](https://tanstack.com/intent) adds them to your agent's instructions:

```sh
npx @tanstack/intent@latest install
```

If your `package.json` already has an `intent.skills` list, Intent loads only the packages it names: add `@mitcsutt/kiln-ui` to it, then check with `npx @tanstack/intent@latest list`.

## Docs

Full documentation, including the token contract and how to write a theme, lives on the [Kiln docs site](https://kiln.mitchellsutton.com). Until it's live, see [`DESIGN.md`](https://github.com/mitcsutt/kiln/blob/main/DESIGN.md) in the repository.

## Licence

[MIT](LICENSE). The bundled fonts keep their own licence (OFL 1.1).
