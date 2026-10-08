import { defineLibraryConfig } from '../../vite.library.ts'

// Publishing build only: the workspace consumes `src/` directly. See vite.library.ts.
// `./theme-script` is its own entry so Node-side tooling can load it without React (ADR 0023),
// and `./highlight` keeps Shiki out of the main entry (ADR 0035).
export default defineLibraryConfig({
  root: import.meta.dirname,
  entry: ['src/index.ts', 'src/theme/script.ts', 'src/highlight/index.ts'],
  classPrefix: 'kiln-',
  baseStylesheet: 'src/styles/index.css',
  stylesheets: {
    'themes/monograph.css': 'src/themes/monograph.css',
    'themes/ledger.css': 'src/themes/ledger.css',
    'themes/fiesta.css': 'src/themes/fiesta.css',
    'themes/flightdeck.css': 'src/themes/flightdeck.css',
    'themes/riso.css': 'src/themes/riso.css',
  },
  assets: 'src/assets',
})
