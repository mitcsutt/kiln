import { globSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { parse } from 'yaml'
import { splitVariants } from '@/lib/variants'
import { contentPages, repoDir } from '@/test/content'
import { buildSkills } from './build'
import { skills } from './manifest'

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

  const spec = skills.find((skill) => skill.name === frontmatter.name)

  it(`stays within its line budget (${String(spec?.maxLines ?? 500)})`, () => {
    expect(content.split('\n').length).toBeLessThanOrEqual(Math.min(spec?.maxLines ?? 500, 500))
  })

  it('leaves out the links to rationale', () => {
    expect(content).not.toMatch(/\[Why\]\(/)
  })
})

// ADR 0038: a page with variant blocks gives a core skill and add-ons, each loaded beside the
// others, so each has a tight budget of its own.
describe('skills split by variant', () => {
  const variantPages = new Set(
    contentPages()
      .filter((page) => splitVariants(page.body).some((segment) => segment.variant))
      .map((page) => page.path.replace(/\/index$/, '')),
  )
  const split = skills.filter(
    (spec) =>
      spec.addOn ?? spec.pages.some((page) => variantPages.has(page.replace(/\/index$/, ''))),
  )

  it('names a core skill of its own package for every add-on', () => {
    for (const spec of skills.filter((skill) => skill.addOn)) {
      const core = skills.find((skill) => skill.name === spec.addOn?.extends)
      expect(core?.package, spec.name).toBe(spec.package)
      expect(core?.addOn, spec.name).toBeUndefined()
    }
  })

  it.each(split.map((spec) => [spec.name, spec] as const))(
    '%s declares a budget',
    (_name, spec) => {
      expect(spec.maxLines).toBeDefined()
    },
  )

  it.each(split.filter((spec) => spec.addOn).map((spec) => [spec.name, spec] as const))(
    '%s has blocks of its variant on its pages',
    (_name, spec) => {
      const blocks = contentPages()
        .filter((page) => spec.pages.includes(page.path.replace(/\/index$/, '')))
        .flatMap((page) => splitVariants(page.body))
        .filter(
          ({ variant }) =>
            variant?.axis === spec.addOn?.variant.axis &&
            variant?.value === spec.addOn?.variant.value,
        )
      expect(blocks.length).toBeGreaterThan(0)
    },
  )
})

describe('every shipped skill is readable by Intent', () => {
  it.each([...new Set(skills.map((spec) => spec.package))])(
    'kiln-%s ships its skills directory',
    (name) => {
      const manifest = JSON.parse(
        readFileSync(join(repoDir, 'packages', name, 'package.json'), 'utf8'),
      ) as { files?: string[]; keywords?: string[] }
      expect(manifest.files).toContain('skills')
      expect(manifest.keywords).toContain('tanstack-intent')
    },
  )
})
