import { mergeConfig } from 'vite'
import { defineLibraryConfig } from '../../vite.library.ts'

// Publishing build only: the workspace consumes `src/` directly. See vite.library.ts.
// One entry per `exports` subpath with code, plus the bin's CLI: the Node entries
// (`./config`, `./generate`, `./mdx-config`, `./next`, `./variants`) and the bin run in plain
// Node, and the layouts each get their own entry so a route segment imports only its own UI
// (ADR 0046). The chrome's CSS Modules land in `styles.css`. Node's built-ins stay imports, for
// the Node entries and the bin, instead of Vite's browser stubs.
export default mergeConfig(
  defineLibraryConfig({
    root: import.meta.dirname,
    entry: [
      'src/index.ts',
      'src/config.ts',
      'src/generate.ts',
      'src/mdx-config.ts',
      'src/next.ts',
      'src/variants.ts',
      'src/layouts/root.tsx',
      'src/layouts/docs.tsx',
      'src/layouts/page.tsx',
      'src/layouts/notFound.tsx',
      'src/layouts/shell.tsx',
      'src/node/cli.ts',
    ],
    classPrefix: 'kiln-docs-',
    baseStylesheet: 'src/styles.css',
  }),
  { build: { rolldownOptions: { external: [/^node:/] } } },
)
