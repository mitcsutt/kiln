import { createRequire } from 'node:module'
import { dirname } from 'node:path'

import { defineConfig, mergeConfig } from 'vitest/config'

import base from './vitest.config.ts'

/**
 * The same suite on React 18.3 instead of 19 (the peer range is `^18.3.0 || ^19.0.0`,
 * ADR 0004). Run with `pnpm test:react18`.
 *
 * React 18 comes from `@mitcsutt/kiln-testing-react18`, a private fixture whose only
 * dependencies are React 18.3.1 and the libraries that `require('react')` themselves, so
 * pnpm resolves all of them against React 18. Aliasing `react` to an `npm:react@18`
 * dev dependency here wouldn't work: `react-dom@18`'s `react` peer would still resolve
 * to this package's React 19.
 *
 * `@testing-library/react` and `radix-ui` come from the fixture too, because Vitest loads
 * them with Node's own `require`, which never sees the aliases below.
 */
const require = createRequire(import.meta.url)
const fixture = dirname(require.resolve('@mitcsutt/kiln-testing-react18/package.json'))
const fromFixture = (name: string) =>
  dirname(require.resolve(`${name}/package.json`, { paths: [fixture] }))

const react = fromFixture('react')
const reactDom = fromFixture('react-dom')

export default mergeConfig(
  base,
  defineConfig({
    resolve: {
      alias: [
        { find: '@testing-library/react', replacement: fromFixture('@testing-library/react') },
        { find: 'radix-ui', replacement: fromFixture('radix-ui') },
        { find: 'react-dom/client', replacement: `${reactDom}/client.js` },
        { find: 'react-dom/test-utils', replacement: `${reactDom}/test-utils.js` },
        { find: 'react/jsx-dev-runtime', replacement: `${react}/jsx-dev-runtime.js` },
        { find: 'react/jsx-runtime', replacement: `${react}/jsx-runtime.js` },
        { find: /^react-dom$/, replacement: reactDom },
        { find: /^react$/, replacement: react },
      ],
    },
    test: { env: { KILN_REACT_MAJOR: '18' } },
  }),
)
