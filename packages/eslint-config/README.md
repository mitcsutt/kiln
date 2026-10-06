# @mitcsutt/kiln-eslint-config

The shared flat [ESLint](https://eslint.org/) config for Kiln and the projects that use it. It's type-aware, has no warning tier (every rule is an error or off), and leaves formatting to Prettier.

## Install

```sh
pnpm add -D @mitcsutt/kiln-eslint-config eslint typescript
```

It needs ESLint 10 and a TypeScript version that [typescript-eslint](https://typescript-eslint.io/users/dependency-versions) supports.

`eslint-plugin-jsx-a11y` hasn't declared ESLint 10 in its peer range yet, so your package manager may warn about it. This package's tests run its rules on ESLint 10. To silence the warning with pnpm 10 or later, add this to `pnpm-workspace.yaml`:

```yaml
peerDependencyRules:
  allowedVersions:
    eslint-plugin-jsx-a11y>eslint: '10'
```

With pnpm 9, put the same rule in your root `package.json`, under `"pnpm": { "peerDependencyRules": { "allowedVersions": { "eslint-plugin-jsx-a11y>eslint": "10" } } }`.

## Usage

Each export is a list of config objects. Start with `base` and add the layers your project needs:

```js
// eslint.config.js
import base from '@mitcsutt/kiln-eslint-config/base'
import react from '@mitcsutt/kiln-eslint-config/react'
import { defineConfig } from 'eslint/config'

export default defineConfig(base, react, {
  languageOptions: {
    parserOptions: { tsconfigRootDir: import.meta.dirname },
  },
})
```

Type-aware rules need every linted file to belong to a `tsconfig.json`, including JavaScript files (`allowJs`).

| Export         | What it adds                                                                                                                                                                                                                |
| -------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `base`         | `@eslint/js` recommended, typescript-eslint `strictTypeChecked` and `stylisticTypeChecked`, type-only import rules, import hygiene with `eslint-plugin-import-x`, Vitest rules for test files, and `eslint-config-prettier` |
| `react`        | `react-hooks` (all errors), `react-refresh`, `jsx-a11y`, browser globals, and Testing Library rules for test files                                                                                                          |
| `storybook`    | `eslint-plugin-storybook` rules for stories and `.storybook/main`                                                                                                                                                           |
| `node`         | Node.js globals, for scripts and tool config files                                                                                                                                                                          |
| `docs-stories` | `kiln/docs-story`: a story tagged `docs` is a docs example, so it needs a JSDoc caption, a `render` that takes no args, package imports only and no `style`. For docs sites that render stories as copyable examples        |

Unused `eslint-disable` comments are errors. Test files, stories, tool config files (`*.config.*`, `.storybook/`) and scripts (`scripts/`) may import dev dependencies, and nothing else can. Template literals take strings and numbers; anything else (`undefined`, `null`, booleans, objects) has to be converted on purpose.

## Docs

Full documentation lives on the [Kiln docs site](https://kiln.mitchellsutton.com).

## Licence

[MIT](LICENSE)
