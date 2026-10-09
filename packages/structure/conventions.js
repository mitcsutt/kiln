/**
 * "Tools win" (ADR 0037): the names and folders that a supported tool gives meaning to. Globs are
 * relative to the source folder (`src`). There are two lists on purpose: naming exemptions relax
 * the folder and naming checks, and boundary exemptions cover generated files only, so routes and
 * the entry point stay inside the import rules.
 */

/** Generated files and codegen output. These are the only boundary exemptions by default. */
export const GENERATED = ['**/*.gen.*', '**/__generated__/**']

/** Folders and files that tools other than the router own, wherever they sit. */
const TOOL_OWNED = [
  ...GENERATED,
  // Vitest and Jest
  '**/__mocks__/**',
  '**/__snapshots__/**',
  // TypeScript declarations, such as Vite's `vite-env.d.ts`
  '**/*.d.ts',
  // Files served as-is
  'public/**',
]

/** Files at the root of the source folder that the bundler or framework looks for. */
const ROOT_FILES = {
  tanstack: [
    // Vite's entry point, and the global stylesheet it imports once
    'main.{js,jsx,ts,tsx}',
    '*.{css,scss,sass,less}',
    // TanStack Start's router factory and entry points
    'router.{js,jsx,ts,tsx}',
    '{client,server,start,ssr}.{js,jsx,ts,tsx}',
  ],
  next: [
    // Next.js's root files, and the global stylesheet
    '{middleware,proxy,instrumentation,instrumentation-client}.{js,ts}',
    '*.{css,scss,sass,less}',
  ],
}

/**
 * Route files, named by the router. TanStack Router owns `routes/`. The Next.js App Router owns
 * `app/`, except the private `_shell` folder, which holds the app shell.
 */
export const ROUTES = {
  tanstack: { folder: 'routes', files: ['routes/**'], except: [] },
  next: { folder: 'app', files: ['app/**'], except: ['app/_shell/**'] },
}

/** Files whose default export a tool requires. */
export const DEFAULT_EXPORT_FILES = ['**/*.stories.*', '**/*.config.*']

/** Test files and stories: the only source files that may import the test-support kind. */
export const TEST_FILES = ['**/*.{test,spec}.*', '**/*.stories.*']

/**
 * @param {'tanstack' | 'next'} router
 * @returns {string[]} Naming exemptions, relative to the source folder.
 */
export function namingExemptions(router) {
  return [...TOOL_OWNED, ...ROOT_FILES[router]]
}

/**
 * The exemption lists as flat-config globs, which are relative to the config file, so each is
 * prefixed with the source folder.
 *
 * @param {import('./options.js').NormalizedOptions} options
 */
export function sourceGlobs({ srcDir, router, ignores }) {
  /** @param {string[]} globs */
  const inSrc = (globs) => globs.map((glob) => `${srcDir}/${glob}`)
  const routes = ROUTES[router]
  return {
    inSrc,
    /** Boundary exemptions: generated files, plus `ignores.boundaries`. */
    generated: inSrc([...GENERATED, ...ignores.boundaries]),
    /** Naming exemptions: tool-owned names, plus `ignores.naming`. */
    namingExempt: inSrc([...namingExemptions(router), ...ignores.naming]),
    /**
     * Route files as an `ignores` list, minus the folder inside them that the structure still
     * governs (Next.js's `_shell`).
     */
    routeFiles: [...inSrc(routes.files), ...inSrc(routes.except).map((glob) => `!${glob}`)],
  }
}
