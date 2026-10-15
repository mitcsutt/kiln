// @vitest-environment node
/**
 * kiln-dnd is used alongside kiln-ui and kiln-forms, so no name may be exported by two of
 * them (ADR 0017's rule, extended): a shared name lets an editor auto-import the wrong one.
 * The docs site keys its API tables by bare export name too.
 */
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'

import ts from 'typescript'
import { describe, expect, it } from 'vitest'

const require = createRequire(import.meta.url)
const dndRoot = join(dirname(new URL(import.meta.url).pathname), '../..')
const uiRoot = dirname(require.resolve('@mitcsutt/kiln-ui/package.json'))

const entries = {
  dnd: join(dndRoot, 'src/index.ts'),
  dndTesting: join(dndRoot, 'src/testing/index.ts'),
  ui: join(uiRoot, 'src/index.ts'),
  forms: join(dndRoot, '../forms/src/index.ts'),
}

function exportNames(): Record<keyof typeof entries, string[]> {
  const configPath = join(dndRoot, 'tsconfig.json')
  const config = ts.getParsedCommandLineOfConfigFile(
    configPath,
    {},
    {
      ...ts.sys,
      onUnRecoverableConfigFileDiagnostic: (diagnostic) => {
        throw new Error(ts.flattenDiagnosticMessageText(diagnostic.messageText, '\n'))
      },
    },
  )
  if (!config) throw new Error(`Can't read ${configPath}`)
  const program = ts.createProgram(Object.values(entries), config.options)
  const checker = program.getTypeChecker()
  const namesOf = (file: string) => {
    const source = program.getSourceFile(file)
    const symbol = source && checker.getSymbolAtLocation(source)
    if (!symbol) throw new Error(`No module symbol for ${file}`)
    return checker.getExportsOfModule(symbol).map((exported) => exported.name)
  }
  return {
    dnd: namesOf(entries.dnd),
    dndTesting: namesOf(entries.dndTesting),
    ui: namesOf(entries.ui),
    forms: namesOf(entries.forms),
  }
}

describe('export names', () => {
  const names = exportNames()

  it('reads every package', () => {
    expect(names.dnd).toContain('Sortable')
    expect(names.ui).toContain('Button')
    expect(names.forms).toContain('FormTextField')
  })

  it('no kiln-dnd export shares a name with a kiln-ui or kiln-forms export', () => {
    const taken = new Set([...names.ui, ...names.forms])
    expect([...names.dnd, ...names.dndTesting].filter((name) => taken.has(name))).toEqual([])
  })
})
