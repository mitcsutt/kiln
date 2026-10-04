import { defineLibraryConfig } from '../../vite.library.ts'

// Publishing build only: the workspace consumes `src/` directly. See vite.library.ts.
export default defineLibraryConfig({
  root: import.meta.dirname,
  classPrefix: 'kiln-',
  baseStylesheet: 'src/styles/index.css',
  stylesheets: {
    'themes/monograph.css': 'src/themes/monograph.css',
    'themes/ledger.css': 'src/themes/ledger.css',
    'themes/fiesta.css': 'src/themes/fiesta.css',
  },
  assets: 'src/assets',
})
