// Types for dependencies that ship none. Not published: consumers get the
// declarations in `types/`.

declare module 'eslint-plugin-jsx-a11y' {
  import type { ESLint, Linter } from 'eslint'

  const plugin: ESLint.Plugin & {
    flatConfigs: { recommended: Linter.Config; strict: Linter.Config }
  }
  export default plugin
}
