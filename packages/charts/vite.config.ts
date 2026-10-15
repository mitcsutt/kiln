import { defineLibraryConfig } from '../../vite.library.ts'

// Publishing build only: the workspace consumes `src/` directly. See vite.library.ts.
// Recharts is a dependency, so it stays external like every dependency and peer; the size
// checks bundle it back in to measure what a consumer ships (size.config.json).
export default defineLibraryConfig({
  root: import.meta.dirname,
  classPrefix: 'kiln-',
})
