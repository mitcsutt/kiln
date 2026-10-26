import { createMarkdown } from './markdown'
import { site } from './site'
import type { DocsPageType } from './source'

/** A page as the loader gives it, with only what the Markdown routes read. */
function page(slugs: string[], title: string, processed: string, description?: string) {
  const url = ['/docs', ...slugs].join('/')
  return {
    slugs,
    url,
    data: { title, description, getText: () => Promise.resolve(processed) },
  } as unknown as DocsPageType
}

const pages = [
  page(['ui'], 'Getting started', 'Install it.', 'Set up kiln-ui.'),
  page([], 'Introduction', 'Kiln is a design system.'),
  page(['ui', 'button'], 'Button', '<Shout>Press it.</Shout>'),
]
const source = { getPages: () => pages }

describe('the Markdown routes', () => {
  it("runs the site's transform over each page's processed Markdown", async () => {
    const markdown = createMarkdown({
      source,
      transform: (processed, entry) =>
        `${processed.replace(/<\/?Shout>/g, '').toUpperCase()} (${entry.url})`,
    })
    await expect(markdown.page(pages[2] as DocsPageType)).resolves.toBe(
      `# Button\n\nSource: ${site.url}/docs/ui/button\n\nPRESS IT. (/docs/ui/button)\n`,
    )
  })

  it('serves the processed Markdown as it is without a transform', async () => {
    const markdown = createMarkdown({ source })
    await expect(markdown.page(pages[0] as DocsPageType)).resolves.toBe(
      `# Getting started\n\n> Set up kiln-ui.\n\nSource: ${site.url}/docs/ui\n\nInstall it.\n`,
    )
  })

  it("lists every page in llms.txt under its section's title, in the source's order", () => {
    const index = createMarkdown({ source }).llmsIndex()
    expect(index).toContain(`# ${site.name}\n\n> ${site.markdown.llms.intro}\n`)
    expect(index).toContain(
      [
        '## UI',
        '',
        `- [Getting started](${site.url}/docs/ui.md): Set up kiln-ui.`,
        `- [Button](${site.url}/docs/ui/button.md)`,
        '',
        '## Start here',
        '',
        `- [Introduction](${site.url}/docs.md)`,
      ].join('\n'),
    )
  })

  it('joins every page in llms-full.txt', async () => {
    const full = await createMarkdown({ source }).llmsFull()
    expect(full.split('\n---\n\n').map((part) => part.split('\n')[0])).toEqual([
      '# Getting started',
      '# Introduction',
      '# Button',
    ])
  })
})
