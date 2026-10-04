import { defineLibraryConfig } from '../../vite.library.ts'

// Publishing build only: the workspace consumes `src/` directly. See vite.library.ts.
// No CSS: kiln-forms renders only through kiln-ui. `./schema` is its own entry so it stays
// free of React (scripts/check-schema-entry.ts runs it without React installed).
export default defineLibraryConfig({
  root: import.meta.dirname,
  entry: ['src/index.ts', 'src/schema/core/index.ts'],
})
