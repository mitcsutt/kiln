import { defineConfig } from 'eslint/config'
import globals from 'globals'

import { SOURCE_FILES } from './globs.js'

/**
 * Node.js globals, for tooling, scripts and config files. Combine it with
 * `base`.
 */
export default defineConfig({
  name: 'kiln/node',
  files: SOURCE_FILES,
  languageOptions: {
    globals: { ...globals.node },
  },
})
