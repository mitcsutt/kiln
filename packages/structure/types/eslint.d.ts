import type { Linter } from 'eslint'

/** Options for `kilnStructure()`, the ESLint preset for Kiln's app structure (ADR 0037). */
export interface KilnStructureOptions {
  /**
   * The declared feature graph: every folder in `src/features/`, and the features it imports
   * directly. Edges aren't transitive. A cycle, or an edge to an undeclared feature, throws when
   * the config loads, and an undeclared feature folder is a lint error.
   *
   * @example { dashboard: ['contacts', 'campaigns'], campaigns: ['contacts'], contacts: [] }
   */
  features: Record<string, readonly string[]>
  /** Kinds this repo adds to the core kinds, which are fixed. */
  kinds?: readonly string[]
  /** Groups inside a kind, such as `{ components: ['sections'] }`. A group holds modules only. */
  groups?: Record<string, readonly string[]>
  /** The test-support kind's folder name. Defaults to `'testing'`. */
  testKind?: string
  /**
   * The router whose conventions apply: TanStack Router's `src/routes/`, or the Next.js App
   * Router's `src/app/` with the shell in `src/app/_shell/`. Defaults to `'tanstack'`.
   */
  router?: 'tanstack' | 'next'
  /** Extra exemptions, as globs relative to `srcDir`. */
  ignores?: {
    /** Files the folder and naming checks skip. Their imports are still checked. */
    naming?: readonly string[]
    /** Files the import rules skip. Keep this to generated code. */
    boundaries?: readonly string[]
  }
  /** The source folder, relative to the ESLint config. Defaults to `'src'`. */
  srcDir?: string
  /**
   * The project root, which the plugins resolve `srcDir` against. Defaults to the current working
   * directory; pass `import.meta.dirname` when ESLint may run from another folder.
   */
  rootDir?: string
}

/**
 * Returns flat config objects that enforce Kiln's app structure in `srcDir`. Throws when the
 * options are invalid.
 */
declare function kilnStructure(options: KilnStructureOptions): Linter.Config[]
export default kilnStructure
