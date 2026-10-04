import base from '@mitcsutt/kiln-eslint-config/base'
import node from '@mitcsutt/kiln-eslint-config/node'
import { defineConfig } from 'eslint/config'

// One config for the whole workspace. Each package runs `eslint .` from its
// own directory and picks this file up, so lint stays cached per package.
export default defineConfig(
  base,
  {
    name: 'kiln/workspace/type-aware',
    languageOptions: {
      parserOptions: {
        tsconfigRootDir: import.meta.dirname,
      },
    },
  },
  {
    name: 'kiln/workspace/node',
    files: [
      '*.{js,ts}',
      'packages/eslint-config/**',
      'packages/prettier-config/**',
      'packages/tsconfig/**',
    ],
    extends: [node],
  },
)
