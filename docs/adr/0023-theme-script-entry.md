# 0023. A React-free `theme-script` entry that plain Node loads

- **Status:** Accepted
- **Date:** 2026-10-05

## Context

A single-page app served from a static `index.html` needs `themeScript` in its `<head>`, like a server-rendered one. The docs show a Vite plugin in `vite.config.ts` that imports `themeScript` and writes it into the page at build time, so the app doesn't copy the script by hand.

A Vite config runs in Node, outside the bundler. A published install works, because its `exports` point at `dist/`. A linked app doesn't: Node never sets the `kiln-dist` condition ([ADR 0022](0022-linked-consumers.md)), so `@mitcsutt/kiln-ui` resolves to `src/index.ts`, and Node can't load Kiln's source (`ERR_UNSUPPORTED_DIR_IMPORT` on its extensionless directory imports). The app can't fix that from its side: Vite's default config loader resolves the config's imports itself, `--configLoader runner` crashes, and `--configLoader native` can't load the app's own extensionless TypeScript imports. Pointing the root entry at `dist/` under a `node` condition would reach Kiln's own Vitest and docs server rendering, which resolve source today.

## Decision

- **`themeScript` and `DEFAULT_STORAGE_KEY` move to `src/theme/script.ts`**, which imports nothing at runtime except the theme registry: no React, no CSS. The root entry still re-exports `themeScript`, so nothing changes for existing imports.
- **`@mitcsutt/kiln-ui/theme-script` is a new subpath for that module**, with its own build entry. Its `exports` entry has three conditions: `kiln-dist` and `node` both point at `dist/theme/script.js`, and `default` points at the source. Plain Node, linked or installed, therefore loads the built file. Bundlers and TypeScript in the workspace don't set `node` for this subpath (nothing in the workspace imports it by name), so they keep resolving source.
- **Proved by a check, not by trust.** `check:package` runs `scripts/check-theme-script-entry.ts`, which imports the subpath in plain Node from the packed tarball in a project with no React, and by name from the package directory as a linked app would, and fails unless both land on the built file. The build fails if a `node` target differs from `publishConfig.exports`, as it does for `kiln-dist`. A size check keeps the entry small and isolated.
- **The SPA recipe imports from the subpath.** The docs, the skill and the README say so, and CONTRIBUTING says that other Node-side imports of a linked Kiln resolve source and fail.

## Consequences

- An SPA's Vite config gets `themeScript` from the same import whether Kiln is linked or installed.
- In a linked app, the subpath serves `dist/`, so it needs a build (`pnpm build:watch`), like the rest of the linked setup.
- Node-side tooling can't import the root entry of a linked Kiln. When it needs something else, that thing gets its own entry like this one rather than an app-side workaround.
