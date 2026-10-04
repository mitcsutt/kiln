import { basename } from 'node:path'

import type { StorybookConfig } from '@storybook/react-vite'

/**
 * The workbench loads the stories co-located with each package's source
 * (`<Name>.stories.tsx`), plus this app's own short MDX pages. Titles follow the
 * ADR 0010 tree (`UI/...`, `Forms/...`, `Tooling/...`), which `tree.test.ts` checks.
 */
const config: StorybookConfig = {
  stories: [
    '../docs/**/*.mdx',
    '../../../packages/ui/src/**/*.stories.@(ts|tsx)',
    '../../../packages/forms/src/**/*.stories.@(ts|tsx)',
  ],
  addons: ['@storybook/addon-docs', '@storybook/addon-a11y', '@storybook/addon-vitest'],
  framework: { name: '@storybook/react-vite', options: {} },
  core: { disableTelemetry: true },
  docs: { defaultName: 'Docs' },
  viteFinal: (viteConfig) => ({
    ...viteConfig,
    // Built for `kiln.mitchellsutton.com/storybook`. Storybook's own pages use
    // relative URLs, so the static build works under any path; this keeps the
    // preview's asset URLs (fonts, chunks) under the same base.
    base: './',
    css: {
      ...viteConfig.css,
      modules: {
        // The class names the published package uses (vite.library.ts), so what
        // the workbench renders matches what a consumer gets.
        generateScopedName: (local: string, file: string) =>
          `kiln-${basename(file).replace(/\.module\.css$/, '')}__${local}`,
      },
    },
  }),
}

export default config
