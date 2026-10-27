import { frontmatter } from 'fumadocs-core/content/md/frontmatter'
import { createMarkdown, type MarkdownPage } from './markdown.ts'

const config = {
  name: 'Kiln',
  url: 'https://kiln.example.com',
  markdown: {
    llms: { intro: 'Kiln is a design system.', sections: { '': 'Start here', ui: 'UI' } },
  },
}

/** A page as the loader gives it, with only what the Markdown routes read. */
function page(slugs: string[], title: string, processed: string, description?: string) {
  return {
    path: `${slugs.join('/') || 'index'}.mdx`,
    slugs,
    url: ['/docs', ...slugs].join('/'),
    data: { title, description, getText: () => Promise.resolve(processed) },
  }
}

const gettingStarted = page(['ui'], 'Getting started', 'Install it.', 'Set up kiln-ui.')
const button = page(['ui', 'button'], 'Button', '<Shout>Press it.</Shout>')
const pages = [
  gettingStarted,
  page([], 'Introduction', 'Kiln is a design system.'),
  button,
  page(['tooling'], 'Tooling', 'Configs.'),
]
const source = { getPages: () => pages }

describe('createMarkdown', () => {
  it("runs the site's transform over each page's processed Markdown", async () => {
    const markdown = createMarkdown({
      config,
      source,
      transform: (processed, entry) =>
        `${processed.replace(/<\/?Shout>/g, '').toUpperCase()} (${entry.url})`,
    })
    await expect(markdown.page(button)).resolves.toBe(
      '# Button\n\nSource: https://kiln.example.com/docs/ui/button\n\nPRESS IT. (/docs/ui/button)\n',
    )
  })

  it('serves the processed Markdown as it is without a transform', async () => {
    await expect(createMarkdown({ config, source }).page(gettingStarted)).resolves.toBe(
      '# Getting started\n\n> Set up kiln-ui.\n\nSource: https://kiln.example.com/docs/ui\n\nInstall it.\n',
    )
  })

  it('fails on a page without processed Markdown, naming it', async () => {
    const bare: MarkdownPage = { path: 'a.md', slugs: ['a'], url: '/docs/a', data: { title: 'A' } }
    await expect(
      createMarkdown({ config, source: { getPages: () => [bare] } }).page(bare),
    ).rejects.toThrow('kiln-docs: a.md has no processed Markdown.')
  })

  // ADR 0046 (W6): Kiln's format, not Fumadocs' `llms()` helper.
  it("writes llms.txt in Kiln's format, by section, in the source's order", () => {
    expect(createMarkdown({ config, source }).llmsIndex()).toBe(
      [
        '# Kiln',
        '',
        '> Kiln is a design system.',
        '',
        'Every page below is Markdown. The whole site in one file: https://kiln.example.com/llms-full.txt',
        '',
        '## UI',
        '',
        '- [Getting started](https://kiln.example.com/docs/ui.md): Set up kiln-ui.',
        '- [Button](https://kiln.example.com/docs/ui/button.md)',
        '',
        '## Start here',
        '',
        '- [Introduction](https://kiln.example.com/docs.md)',
        '',
        // A folder with no title in config is headed by its name.
        '## tooling',
        '',
        '- [Tooling](https://kiln.example.com/docs/tooling.md)',
        '',
      ].join('\n'),
    )
  })

  it("heads pages outside any folder with the site's name when config has no title for them", () => {
    const bare = { ...config, markdown: { llms: { intro: 'A design system.', sections: {} } } }
    expect(createMarkdown({ config: bare, source }).llmsIndex()).toContain(
      '## Kiln\n\n- [Introduction](https://kiln.example.com/docs.md)',
    )
  })

  it('joins every page in llms-full.txt', async () => {
    const full = await createMarkdown({ config, source }).llmsFull()
    expect(full.split('\n---\n\n').map((part) => part.split('\n')[0])).toEqual([
      '# Getting started',
      '# Introduction',
      '# Button',
      '# Tooling',
    ])
  })

  // ADR 0046 (W8): a reader that took frontmatter line by line put `>-` into descriptions.
  describe('a description written as a YAML block scalar', () => {
    const described = (yaml: string) => {
      const { data } = frontmatter(`---\ntitle: Review\n${yaml}\n---\nBody`)
      const { description } = data as { description: string }
      return page(['review'], 'Review', 'Body', description)
    }

    it.each([
      ['>-', 'description: >-\n  Reviews a diff\n  with a panel.'],
      ['>', 'description: >\n  Reviews a diff\n  with a panel.'],
      ['|', 'description: |\n  Reviews a diff\n  with a panel.'],
      ['|-', 'description: |-\n  Reviews a diff\n  with a panel.'],
    ])('stays on one line with no %s marker', async (_marker, yaml) => {
      const entry = described(yaml)
      const markdown = createMarkdown({ config, source: { getPages: () => [entry] } })
      expect(markdown.llmsIndex()).toContain(
        '- [Review](https://kiln.example.com/docs/review.md): Reviews a diff with a panel.\n',
      )
      await expect(markdown.page(entry)).resolves.toContain('\n> Reviews a diff with a panel.\n')
    })
  })
})
