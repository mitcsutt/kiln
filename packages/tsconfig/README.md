# @mitcsutt/kiln-tsconfig

Shared [TypeScript](https://www.typescriptlang.org/) presets for Kiln and the projects that use it.

## Install

```sh
pnpm add -D @mitcsutt/kiln-tsconfig typescript
```

## Usage

Extend one preset, or combine several. Later presets win, and every preset carries `base`'s `lib`, so put `react` last to keep the DOM libraries:

```json
{
  "extends": ["@mitcsutt/kiln-tsconfig/library", "@mitcsutt/kiln-tsconfig/react"],
  "include": ["src"]
}
```

| Preset      | What it sets                                                                                                                             |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------------------- |
| `base`      | `strict`, `noUncheckedIndexedAccess`, `noImplicitOverride`, `verbatimModuleSyntax`, `isolatedModules`, Bundler resolution, ES2022 target |
| `react`     | `base`, plus the DOM libraries and the automatic JSX runtime                                                                             |
| `library`   | `base`, plus declarations, declaration maps and source maps                                                                              |
| `app`       | `base`, plus `noEmit` and `allowJs`, for apps that a bundler or framework builds                                                         |
| `react-app` | `react` and `app` in one preset, for React apps                                                                                          |
| `node`      | `base`, with Node.js module resolution (`NodeNext`) and Node.js types, for scripts and tooling. It needs `@types/node`.                  |

For a React app, extend `react-app` rather than `["app", "react"]`. Both of those extend `base`, and esbuild (which Vite and Vitest run) prints `Base config file "./base.json" forms cycle` for a config that reaches `base` twice. `react-app` reaches it once.

Every preset can also be imported with its `.json` extension, for example `@mitcsutt/kiln-tsconfig/base.json`.

## Docs

Full documentation lives on the [Kiln docs site](https://kiln.mitchellsutton.com).

## Licence

[MIT](LICENSE)
