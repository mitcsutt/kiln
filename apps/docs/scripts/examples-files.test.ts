import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { examplesFiles, examplesOf } from './examples-files'

describe('examplesOf', () => {
  it('names a file beside an export after the export', () => {
    expect(examplesOf('packages/ui/src/components/actions/Button/Button.examples.tsx')).toBe(
      'Button',
    )
    expect(examplesOf('packages/forms/src/hooks/useAutosave.examples.tsx')).toBe('useAutosave')
  })

  it("names a guide's file by its path under src/docs", () => {
    expect(examplesOf('packages/forms/src/docs/getting-started/schemas.examples.tsx')).toBe(
      'forms/getting-started/schemas',
    )
    expect(examplesOf('packages/ui/src/docs/patterns/SettingsPage.examples.tsx')).toBe(
      'ui/patterns/settings-page',
    )
  })

  it('rejects a file outside a package source folder', () => {
    expect(() => examplesOf('apps/docs/Button.examples.tsx')).toThrow(/isn't an examples file/)
  })
})

describe('examplesFiles', () => {
  let repo: string

  beforeEach(() => {
    repo = mkdtempSync(join(tmpdir(), 'kiln-docs-examples-files-'))
  })

  afterEach(() => {
    rmSync(repo, { recursive: true, force: true })
  })

  function touch(file: string) {
    mkdirSync(dirname(join(repo, file)), { recursive: true })
    writeFileSync(join(repo, file), '')
  }

  it('finds every examples file in the packages, and nothing else', () => {
    touch('packages/ui/src/components/actions/Button/Button.examples.tsx')
    touch('packages/ui/src/components/actions/Button/Button.stories.tsx')
    touch('packages/forms/src/docs/getting-started/schemas.examples.tsx')
    touch('apps/docs/examples/ui/actions/button.tsx')
    expect(examplesFiles(repo)).toEqual([
      {
        of: 'forms/getting-started/schemas',
        file: 'packages/forms/src/docs/getting-started/schemas.examples.tsx',
      },
      { of: 'Button', file: 'packages/ui/src/components/actions/Button/Button.examples.tsx' },
    ])
  })

  it('fails when two files would share a name', () => {
    touch('packages/ui/src/components/actions/Button/Button.examples.tsx')
    touch('packages/forms/src/components/Button.examples.tsx')
    expect(() => examplesFiles(repo)).toThrow(/both the examples of Button/)
  })
})
