# 0014. Shape of the shared config packages

- **Status:** Accepted
- **Date:** 2026-10-04

## Context

[0007](0007-shared-config-packages.md) sets what the ESLint, Prettier and TypeScript config packages contain, but leaves some details open: how the ESLint exports compose, what happens to the warn-level rules inside plugin presets, whether Kiln needs `node` variants, and which ESLint major to target. When the packages were built, ESLint 9 had reached end of life, while `eslint-plugin-jsx-a11y` (named in 0007) still declared support only up to ESLint 9.

## Decision

- **ESLint exports are layers.** `@mitcsutt/kiln-eslint-config` exports `base`, `react`, `storybook` and `node` as subpaths. Each is a list of config objects that adds to `base` rather than repeating it, so a project composes exactly what it needs: `defineConfig(base, react, storybook)`.
- **No warning tier.** Every rule is an error or off. Plugin presets that ship warnings (react-hooks, Storybook, Vitest, Testing Library, jsx-a11y) have those rules raised to errors, and a test fails if the exports, combined, contain any warn-level rule. This is how 0007's "no only-warn downgrades" is applied to third-party presets.
- **`node` variants.** Kiln's own tooling and config files run in Node, so the ESLint config has a `node` export (Node globals) and the TS config has a `node` preset (`NodeNext` resolution, Node types).
- **ESLint 10.** The config targets ESLint 10 and keeps the upstream `eslint-plugin-jsx-a11y`. Its rules are covered by tests on ESLint 10, and the workspace allows its stale peer range. Moving to a fork such as `eslint-plugin-jsx-a11y-x` would need a new record.
- **Plain JavaScript, no build.** The ESLint and Prettier configs are ESM JavaScript, type-checked with `checkJs`, and ship hand-written declarations in `types/`. The TS presets are JSON. None of the three has a build step.
- **One workspace ESLint config.** Kiln lints with a single root `eslint.config.js` built from the published exports. Each package runs `eslint .` from its own directory, so lint is still cached per package.

## Consequences

- Consumers may see a peer-dependency warning for `eslint-plugin-jsx-a11y` until it declares ESLint 10 support.
- A rule that a plugin ships as a warning becomes a hard failure in Kiln and in consumers, which can make a plugin upgrade a breaking change for the config package.
- Package-specific lint rules for `ui` and `forms` are added to the root config, scoped to their directories.
