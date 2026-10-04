# @mitcsutt/kiln-testing-react18

A private test fixture, never published. Kiln's runtime packages support React 18.3 and 19 ([ADR 0004](../../docs/adr/0004-react-18-and-19.md)), so their suites run twice: once on the workspace's React 19, and once on React 18.3 through `vitest.react18.config.ts`.

That second pass needs a React 18 stack that pnpm resolves on its own. Aliasing `react` to an `npm:react@18.3.1` dev dependency inside the package under test doesn't work, because `react-dom@18`'s `react` peer still resolves to the package's own React 19. This package has only React 18.3.1 and the libraries that `require('react')` natively (`@testing-library/react`, `radix-ui`), so everything it resolves agrees on React 18.

`vitest.react18.config.ts` resolves `react`, `react-dom`, `@testing-library/react` and `radix-ui` from here.
