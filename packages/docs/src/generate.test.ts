import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { dirname, join } from 'node:path'
import { DEFAULT_GENERATED_DIR } from './config.ts'
import { writeGenerated } from './generate.ts'

let root: string

/** Writes files into the site under test, by their path from its root. */
function write(files: Record<string, string>) {
  for (const [path, content] of Object.entries(files)) {
    mkdirSync(dirname(join(root, path)), { recursive: true })
    writeFileSync(join(root, path), content)
  }
}

/** Every file under a folder of the site, by its path inside it. */
const listed = (dir: string) =>
  readdirSync(join(root, dir), { recursive: true, withFileTypes: true })
    .filter((entry) => entry.isFile())
    .map((entry) => join(entry.parentPath, entry.name).slice(join(root, dir).length + 1))
    .sort()

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'kiln-docs-generate-'))
  vi.spyOn(console, 'warn').mockImplementation(() => undefined)
})

afterEach(() => {
  rmSync(root, { recursive: true, force: true })
  vi.restoreAllMocks()
})

describe('writeGenerated', () => {
  it('writes into .generated/pages by default', () => {
    expect(DEFAULT_GENERATED_DIR).toBe('.generated/pages')
    const report = writeGenerated(
      [
        { path: 'plugins/git.md', content: '# Git' },
        { path: 'plugins/meta.json', content: '{}' },
      ],
      { root },
    )
    expect(report).toEqual({ written: ['plugins/git.md', 'plugins/meta.json'], skipped: [] })
    expect(readFileSync(join(root, '.generated/pages/plugins/git.md'), 'utf8')).toBe('# Git')
  })

  it('writes into the folder a site configures', () => {
    writeGenerated([{ path: 'a.md', content: '' }], { root, dir: 'build/docs' })
    expect(listed('build/docs')).toEqual(['a.md'])
  })

  // ADR 0045: a site's `.generated/` may hold its other build data (Kiln's api.json, tokens.json
  // and example slices).
  it('empties the generated-pages folder and nothing else', () => {
    write({
      '.generated/api.json': '{}',
      '.generated/pages/stale.md': '',
      'content/docs/index.mdx': '',
    })
    writeGenerated([{ path: 'fresh.md', content: '' }], { root })
    expect(listed('.generated')).toEqual(['api.json', 'pages/fresh.md'])
    expect(listed('content/docs')).toEqual(['index.mdx'])
  })

  describe.each([
    ['.mdx', '.md'],
    ['.md', '.mdx'],
    ['.mdx', '.mdx'],
    ['.md', '.md'],
  ])('a hand-written %s page over a generated %s page', (handWritten, generated) => {
    it.each([
      ['an index page', 'plugins/git/index'],
      ['a leaf page', 'plugins/git'],
    ])('skips the generated one on %s, and reports it', (_, slug) => {
      write({ [`content/docs/${slug}${handWritten}`]: 'hand-written' })
      const report = writeGenerated(
        [
          { path: `${slug}${generated}`, content: 'generated' },
          { path: 'other.md', content: '' },
        ],
        { root },
      )
      expect(report).toEqual({
        written: ['other.md'],
        skipped: [{ path: `${slug}${generated}`, shadowedBy: `${slug}${handWritten}` }],
      })
      expect(listed('.generated/pages')).toEqual(['other.md'])
      expect(console.warn).toHaveBeenCalledExactlyOnceWith(
        `kiln-docs: skipped the generated ${slug}${generated}: the hand-written content/docs/${slug}${handWritten} takes its place.`,
      )
    })
  })

  it('skips a generated meta file a hand-written one has the path of', () => {
    write({ 'content/docs/plugins/meta.json': '{}' })
    const report = writeGenerated([{ path: 'plugins/meta.json', content: '{}' }], { root })
    expect(report.skipped).toEqual([{ path: 'plugins/meta.json', shadowedBy: 'plugins/meta.json' }])
  })

  it.each([
    ['plugins/git/index.mdx', 'plugins/git.md'],
    ['plugins/git.md', 'plugins/git/index.mdx'],
  ])('skips the generated %2$s under the hand-written %1$s', (handWritten, generated) => {
    write({ [`content/docs/${handWritten}`]: 'hand-written' })
    expect(writeGenerated([{ path: generated, content: 'generated' }], { root })).toEqual({
      written: [],
      skipped: [{ path: generated, shadowedBy: handWritten }],
    })
    expect(listed('.generated/pages')).toEqual([])
  })

  it('fails on two generated pages with one slug, before writing anything', () => {
    write({ '.generated/pages/kept.md': '' })
    expect(() =>
      writeGenerated(
        [
          { path: 'git/index.md', content: '' },
          { path: 'git/index.mdx', content: '' },
        ],
        { root },
      ),
    ).toThrow(
      'kiln-docs: git/index.md and git/index.mdx in the generated pages are one page, git. Keep one of them.',
    )
    expect(() =>
      writeGenerated(
        [
          { path: 'git.md', content: '' },
          { path: 'git.mdx', content: '' },
        ],
        { root },
      ),
    ).toThrow('are one page, git.')
    expect(() =>
      writeGenerated(
        [
          { path: 'git.md', content: '' },
          { path: 'git/index.md', content: '' },
        ],
        { root },
      ),
    ).toThrow('are one page, git.')
    expect(listed('.generated/pages')).toEqual(['kept.md'])
  })

  it('fails on a meta file written twice', () => {
    expect(() =>
      writeGenerated(
        [
          { path: 'meta.json', content: '{}' },
          { path: 'meta.json', content: '{}' },
        ],
        { root },
      ),
    ).toThrow('kiln-docs: meta.json is generated twice.')
  })

  it.each(['../escape.md', '/abs.md', 'a/./b.md', 'a\\b.md', 'notes.txt', 'meta.js'])(
    'refuses %s as a path',
    (path) => {
      expect(() => writeGenerated([{ path, content: '' }], { root })).toThrow(
        `kiln-docs: ${path} isn't a generated page`,
      )
    },
  )

  it.each(['.', '..', 'content', 'content/docs', 'content/docs/generated'])(
    'refuses %s as the folder, so it never empties the site or its hand-written pages',
    (dir) => {
      write({ 'content/docs/index.mdx': '' })
      expect(() => writeGenerated([], { root, dir })).toThrow(
        'kiln-docs: the generated-pages folder',
      )
      expect(listed('content/docs')).toEqual(['index.mdx'])
    },
  )
})
