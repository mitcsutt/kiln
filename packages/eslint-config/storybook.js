import { defineConfig } from 'eslint/config'
import storybook from 'eslint-plugin-storybook'

import { asErrors } from './severity.js'

/**
 * Storybook rules for stories and `.storybook/main`. Combine it with `base`
 * and `react`.
 */
export default defineConfig({
  name: 'kiln/storybook',
  extends: [storybook.configs['flat/recommended'].map(asErrors)],
})
