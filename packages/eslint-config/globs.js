/** Every JavaScript and TypeScript source file. */
export const SOURCE_FILES = ['**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']

/** Files that hold JSX. */
export const JSX_FILES = ['**/*.{jsx,tsx}']

/** Vitest test files. */
export const TEST_FILES = [
  '**/*.{test,spec}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}',
  '**/__tests__/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}',
]

/** Storybook stories. */
export const STORY_FILES = ['**/*.{stories,story}.{js,jsx,mjs,cjs,ts,tsx,mts,cts}']

/** Tool config files, which may import dev dependencies. */
export const CONFIG_FILES = [
  '**/*.config.{js,mjs,cjs,ts,mts,cts}',
  '**/.storybook/**/*.{js,jsx,mjs,cjs,ts,tsx,mts,cts}',
]

/** Build, codegen and maintenance scripts, which may import dev dependencies. */
export const SCRIPT_FILES = ['**/scripts/**/*.{js,mjs,cjs,ts,mts,cts}']
