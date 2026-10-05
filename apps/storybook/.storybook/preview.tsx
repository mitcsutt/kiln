import '@mitcsutt/kiln-ui/styles.css'
import '@mitcsutt/kiln-ui/themes/monograph.css'
import '@mitcsutt/kiln-ui/themes/ledger.css'
import '@mitcsutt/kiln-ui/themes/fiesta.css'
import './preview.css'

import { DEFAULT_THEME, THEMES, THEME_META, type ColorMode } from '@mitcsutt/kiln-ui'
import type { Decorator, Preview } from '@storybook/react-vite'

import { ThemeFrame, type ThemeGlobal } from './ThemeFrame'

/**
 * Every story renders in the theme and mode chosen in the toolbar. "All themes, side
 * by side" renders the story once per built-in theme, each in its own `ThemeScope`:
 * the quickest way to check a component holds up in every theme.
 */
const withTheme: Decorator = (Story, context) => {
  const globals = context.globals as { theme?: ThemeGlobal; mode?: ColorMode }
  return (
    <ThemeFrame
      theme={globals.theme ?? DEFAULT_THEME}
      mode={globals.mode ?? 'light'}
      layout={context.parameters.layout as string | undefined}
    >
      {() => <Story />}
    </ThemeFrame>
  )
}

/**
 * A component's description on its Docs page, from the TSDoc the docs site shows: the summary and
 * `@remarks`, without the other tags (`@privateRemarks`, `@value`, `@example`…), and with
 * `{@link X | text}` as its text. react-docgen hands over the whole doc comment (ADR 0029).
 */
function componentDescription(component: unknown): string | null {
  const docgen = (component as { __docgenInfo?: { description?: string } } | null | undefined)
    ?.__docgenInfo
  if (!docgen?.description) return null
  const [summary = '', ...tags] = docgen.description.split(/^@(?=\w)/m)
  const remarks = tags.find((tag) => tag.startsWith('remarks'))?.replace(/^remarks\s*/, '') ?? ''
  return [summary.trim(), remarks.trim()]
    .filter(Boolean)
    .join('\n\n')
    .replace(/\{@link\s+([^}|\s]+)\s*(?:\|\s*([^}]+))?\}/g, (_, name: string, text?: string) =>
      (text ?? name).trim(),
    )
}

const preview: Preview = {
  // Every component gets a Storybook Docs page with all its stories. The docs site is a
  // separate choice: only stories tagged `docs` reach it (ADR 0028).
  tags: ['autodocs'],
  globalTypes: {
    theme: {
      description: 'Theme',
      toolbar: {
        title: 'Theme',
        icon: 'paintbrush',
        items: [
          ...THEMES.map((name) => ({ value: name, title: THEME_META[name].label })),
          { value: 'all', title: 'All themes, side by side' },
        ],
        dynamicTitle: true,
      },
    },
    mode: {
      description: 'Colour mode',
      toolbar: {
        title: 'Mode',
        icon: 'mirror',
        items: [
          { value: 'light', title: 'Light', icon: 'sun' },
          { value: 'dark', title: 'Dark', icon: 'moon' },
          { value: 'system', title: 'System', icon: 'browser' },
        ],
        dynamicTitle: true,
      },
    },
  },
  // `STORYBOOK_THEME` and `STORYBOOK_MODE` pick the starting theme and mode, so the
  // story tests can run once per theme and mode (vitest.config.ts).
  initialGlobals: {
    theme: import.meta.env.STORYBOOK_THEME ?? DEFAULT_THEME,
    mode: import.meta.env.STORYBOOK_MODE ?? 'light',
  },
  decorators: [withTheme],
  parameters: {
    layout: 'padded',
    docs: { extractComponentDescription: componentDescription },
    backgrounds: { disable: true },
    controls: {
      expanded: true,
      matchers: { color: /(background|color)$/i, date: /date$/i },
    },
    // Any axe violation fails the story's test, in the Vitest addon and in CI.
    a11y: { test: 'error' },
    options: {
      storySort: {
        order: [
          'Introduction',
          'UI',
          [
            'Foundations',
            ['Tokens', 'Colour', 'Type', 'Spacing', 'Motion', 'Theming'],
            'Actions',
            'Inputs',
            'Layout',
            'Display',
            'Navigation',
            'Feedback',
            'Overlays',
            'Typography',
            'Themes',
            'Patterns',
          ],
          'Forms',
          ['Getting started', 'Fields', 'Layouts', 'Hooks', 'Schema'],
          'Tooling',
        ],
      },
    },
  },
}

export default preview
