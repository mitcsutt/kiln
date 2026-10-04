import { globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { repoDir } from '@/test/content'
import { buildSkills } from './build'

// ADR 0011: the skills kiln-ui and kiln-forms ship are built from the docs pages, so the two
// can't drift. A failure here means a page changed: run `pnpm generate:skills` and commit.
const files = buildSkills()

describe('the agent skills match the docs', () => {
  it.each([...files.keys()])('%s', async (path) => {
    await expect(files.get(path)).toMatchFileSnapshot(join(repoDir, path))
  })

  it('ships nothing the docs no longer produce', () => {
    const shipped = globSync('packages/*/skills/**/*', { cwd: repoDir, withFileTypes: true })
      .filter((entry) => entry.isFile())
      .map((entry) => join(entry.parentPath, entry.name).slice(repoDir.length + 1))
    expect(shipped.filter((file) => !files.has(file))).toEqual([])
  })
})

// The structural rules `intent validate` enforces, checked here so a docs edit fails fast.
describe.each([...files].filter(([path]) => path.endsWith('/SKILL.md')))('%s', (path, content) => {
  const frontmatter = parse(/^---\n([\s\S]*?)\n---\n/.exec(content)?.[1] ?? '') as {
    name?: string
    description?: string
    metadata?: Record<string, unknown>
  }

  it('is named after its directory', () => {
    expect(frontmatter.name).toBe(path.split('/').at(-2))
    expect(frontmatter.name).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  })

  it('has a description under 1024 characters', () => {
    expect(frontmatter.description?.length).toBeGreaterThan(0)
    expect(frontmatter.description?.length).toBeLessThanOrEqual(1024)
  })

  it('has string metadata', () => {
    for (const value of Object.values(frontmatter.metadata ?? {}))
      expect(typeof value).toBe('string')
  })

  it('stays under 500 lines', () => {
    expect(content.split('\n').length).toBeLessThanOrEqual(500)
  })
})

describe('every shipped skill is readable by Intent', () => {
  it.each(['ui', 'forms'])('kiln-%s ships its skills directory', (name) => {
    const manifest = JSON.parse(
      readFileSync(join(repoDir, 'packages', name, 'package.json'), 'utf8'),
    ) as { files?: string[]; keywords?: string[] }
    expect(manifest.files).toContain('skills')
    expect(manifest.keywords).toContain('tanstack-intent')
  })
})
