// @vitest-environment node
/**
 * `@mitcsutt/kiln-forms/schema` must load on a server without React or a DOM (§10.8–10.9). Two checks:
 * 1. the runtime import graph from `schema/core/index.ts` (type-only imports excluded) reaches no
 *    package at all — in particular not `react`, `@tanstack/react-form` or `@mitcsutt/kiln-ui`;
 * 2. the entry imports and works in Vitest's `node` environment.
 */
import { describe, expect, it } from 'vitest'

interface Fs {
  readFileSync(path: string, encoding: 'utf8'): string
  existsSync(path: string): boolean
  statSync(path: string): { isFile(): boolean }
}

const srcDir = decodeURIComponent(new URL('../../', import.meta.url).pathname)

// Matches `import … from 'x'`, `export … from 'x'` (type-only flagged) and bare `import 'x'`.
const STATEMENT =
  /(?:^|\n)\s*(import|export)(\s+type)?\s+(?:\{[^}]*\}|\*(?:\s+as\s+\w+)?|\w+(?:\s*,\s*\{[^}]*\})?)\s+from\s+['"]([^'"]+)['"]|(?:^|\n)\s*import\s+['"]([^'"]+)['"]/g

function runtimeSpecifiers(source: string): string[] {
  const out: string[] = []
  for (const match of source.matchAll(STATEMENT)) {
    const [, , typeOnly, from, bare] = match
    if (bare) out.push(bare)
    else if (from && !typeOnly) out.push(from)
  }
  return out
}

async function runtimeGraph(entry: string) {
  const fs = (await import(/* @vite-ignore */ 'node:fs')) as Fs
  const isFile = (path: string) => fs.existsSync(path) && fs.statSync(path).isFile()
  const resolveHash = (specifier: string): string => {
    const base = `${srcDir}${specifier.slice(1)}`
    const candidates = [base, `${base}.ts`, `${base}.tsx`, `${base}/index.ts`, `${base}/index.tsx`]
    const found = candidates.find(isFile)
    if (!found) throw new Error(`cannot resolve ${specifier}`)
    return found
  }
  const files = new Set<string>()
  const packages = new Set<string>()
  const visit = (file: string) => {
    if (files.has(file)) return
    files.add(file)
    for (const specifier of runtimeSpecifiers(fs.readFileSync(file, 'utf8'))) {
      if (specifier.startsWith('#')) visit(resolveHash(specifier))
      else packages.add(specifier)
    }
  }
  visit(entry)
  return {
    files: [...files].map((file) => file.slice(srcDir.length)).sort(),
    packages: [...packages],
  }
}

describe('@mitcsutt/kiln-forms/schema without React', () => {
  it('runs in a node environment (no DOM)', () => {
    expect(typeof document).toBe('undefined')
    expect(typeof window).toBe('undefined')
  })

  it('the parser sees through multi-line and type-only imports', () => {
    const source = [
      "import type { A } from 'react'",
      "import {\n  b,\n  type C,\n} from '#runtime/x'",
      "export type { D } from '@mitcsutt/kiln-ui'",
      "export { e } from '#schema/core/e'",
      "import 'side-effect'",
    ].join('\n')
    expect(runtimeSpecifiers(source)).toEqual(['#runtime/x', '#schema/core/e', 'side-effect'])
  })

  it('the runtime import graph reaches no package', async () => {
    const graph = await runtimeGraph(`${srcDir}schema/core/index.ts`)
    expect(graph.packages).toEqual([])
    for (const file of graph.files) {
      expect(
        ['schema/core/', 'runtime/messages.ts', 'runtime/errors.ts', 'utils/paths.ts'].some((ok) =>
          file.startsWith(ok),
        ),
      ).toBe(true)
    }
  })

  it('control: a React module is detected', async () => {
    expect((await runtimeGraph(`${srcDir}utils/env.ts`)).packages).toContain('react')
  })

  it('imports and works', async () => {
    const schema = await import('#schema/core')
    const json = {
      version: 1,
      root: {
        layout: 'stack',
        children: [
          {
            kind: 'text',
            name: 'email',
            label: 'Email',
            rules: [{ rule: 'required' }, { rule: 'email' }],
          },
          {
            kind: 'text',
            name: 'company',
            label: 'Company',
            rules: [{ rule: 'required' }],
            when: { context: 'audience', op: 'eq', value: 'business' },
          },
        ],
      },
    }
    const parsed = schema.parseFormSchema(json, { kinds: ['text'] })
    if (!parsed.ok) throw new Error(JSON.stringify(parsed.issues))
    const standard = schema.toStandardSchema(parsed.schema, { context: { audience: 'business' } })
    const result = (await standard['~standard'].validate({
      email: 'ada@example.com',
      company: '',
    })) as {
      issues?: readonly { message: string; path?: readonly unknown[] }[]
    }
    expect(result.issues).toEqual([{ message: 'Enter a value', path: ['company'] }])
    expect(schema.evaluateCondition({ field: 'email', op: 'notEmpty' }, { email: 'x' })).toBe(true)
  })
})
