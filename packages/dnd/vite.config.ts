import { defineLibraryConfig } from '../../vite.library.ts'

// Publishing build only: the workspace consumes `src/` directly. See vite.library.ts.
// `./testing` is its own entry so the jsdom stubs never reach an app bundle. The engine
// (`@dnd-kit/dom`) stays a dependency and loads through a dynamic import on the client
// (src/core/engine.ts), so the server never evaluates it.
export default defineLibraryConfig({
  root: import.meta.dirname,
  entry: ['src/index.ts', 'src/testing/index.ts'],
  classPrefix: 'kiln-dnd-',
})
