/**
 * Finds the examples files that sit beside the code they document,
 * `packages/<pkg>/src/**\/*.examples.tsx`, and names each one the way pages refer to it in
 * `<Example of="…" />`. ADR 0025 has the convention.
 */
import { globSync } from 'node:fs'
import { sep } from 'node:path'

export interface ExamplesFile {
  /** `Button`, or a guide's path such as `forms/getting-started/schemas`. */
  of: string
  /** Relative to the repo: `packages/ui/src/components/actions/Button/Button.examples.tsx`. */
  file: string
}

/** `OneTimeCodeField` → `one-time-code-field`, as Storybook titles map to page paths. */
function kebab(segment: string): string {
  return segment
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/\s+/g, '-')
    .toLowerCase()
}

/**
 * An examples file's name in `<Example of>`. Beside an export, the file is named after it, so
 * `Button/Button.examples.tsx` is `Button`. Under a package's `src/docs/` it belongs to a guide
 * and is named by its path: `packages/forms/src/docs/getting-started/schemas.examples.tsx` is
 * `forms/getting-started/schemas`.
 */
export function examplesOf(file: string): string {
  const match = /^packages\/([^/]+)\/src\/(?:docs\/(.+)|(?:.+\/)?([^/]+))\.examples\.tsx$/.exec(
    file,
  )
  if (!match) throw new Error(`${file} isn't an examples file in a package's src/.`)
  const [, pkg = '', guide, owner = ''] = match
  return guide ? `${pkg}/${guide.split('/').map(kebab).join('/')}` : owner
}

/** Every examples file in the packages, sorted by path. Two files can't share a name. */
export function examplesFiles(repoDir: string): ExamplesFile[] {
  const files = globSync('packages/*/src/**/*.examples.tsx', { cwd: repoDir })
    .map((file) => file.split(sep).join('/'))
    .sort()
  const seen = new Map<string, string>()
  return files.map((file) => {
    const of = examplesOf(file)
    const other = seen.get(of)
    if (other) throw new Error(`${other} and ${file} are both the examples of ${of}.`)
    seen.set(of, file)
    return { of, file }
  })
}
