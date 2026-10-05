# 0022. Linked consumers resolve built output through `kiln-dist`

- **Status:** Accepted (amends [0005](0005-library-build.md))
- **Date:** 2026-10-05

## Context

An app that adopts Kiln finds problems that are best fixed in Kiln, and waiting for a release to try each fix is slow. The app needs to link a local Kiln checkout (`link:`) and use it the way it will use the published packages.

A linked package is resolved through its own `package.json`. Kiln's `exports` point at `src/`, because the workspace consumes source ([ADR 0005](0005-library-build.md)), and only `publishConfig.exports` points at `dist/`. A linked app therefore got TypeScript source with `#` imports and CSS Modules. Its own `tsc` checked Kiln's source under the app's compiler settings and failed, and its bundler had to compile Kiln the way Kiln does, so the app wasn't testing what it would install.

Linking also gives the app two copies of React. A linked package and its dependencies (`radix-ui`, `@tanstack/react-form`) resolve React from Kiln's `node_modules`. A bundler can dedupe that in the browser, but in server rendering the dependencies are left to Node, which loads Kiln's React. Hooks then fail with "Invalid hook call".

## Decision

- **Every `exports` subpath has a `kiln-dist` condition** that points at the built file, and its `default` stays the source file. Inside the workspace nothing sets `kiln-dist`, so Vite, Next.js, Vitest, TypeScript and ESLint keep resolving source, as ADR 0005 says. A linked app opts in by adding `kiln-dist` to its bundler's resolve conditions and to `customConditions` in its tsconfig.
- **`kiln-dist` is exactly what publishing ships.** Each target equals the `publishConfig.exports` entry for that subpath. `vite.library.ts` checks this on every build and fails if they differ. Packing replaces `exports` with `publishConfig.exports`, so the condition never reaches npm.
- **Each runtime package has `build:watch`** (`vite build --watch`), and the root `pnpm build:watch` runs them all. Watch mode doesn't empty `dist/` between rebuilds, so the app never sees a half-written package, and it rebuilds when a global stylesheet or theme preset changes, even though those are bundled outside the module graph.
- **The app gets one React by resolving Kiln's dependencies from its own `node_modules`.** It installs `radix-ui` and `@tanstack/react-form` itself, at the versions Kiln uses, and dedupes them with React. CONTRIBUTING.md has the setup.

## Consequences

- A linked app type-checks against the published declarations and bundles the published JavaScript and CSS, including the generated class names and font files.
- The app carries setup that it removes when it goes back to the published packages: the condition, the dedupe list, the extra dependencies, and permission for its dev server to read files from the Kiln checkout. The condition is harmless after unlinking, because published packages don't have it.
- A new `exports` subpath has to be added in three places: `exports` with both conditions, `publishConfig.exports`, and the build. The build check catches a mismatch between the first two.
- Dist output only changes after a rebuild, so whoever changes Kiln for a linked app runs `pnpm build:watch` or `pnpm build`.
