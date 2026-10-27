import { evaluate } from '@mdx-js/mdx'
import { applyMdxPreset } from 'fumadocs-mdx/config'
import { createElement } from 'react'
import * as runtime from 'react/jsx-runtime'
import { renderToStaticMarkup } from 'react-dom/server'
import { z } from 'zod'
import { DEFAULT_CONTENT_DIR, DEFAULT_GENERATED_DIR } from './config.ts'
import { defineDocsCollections, defineDocsConfig } from './mdx-config.ts'

interface Node {
  type: string
  children?: Node[]
}

/** A page's HTML, compiled as fumadocs-mdx compiles it, with the site's MDX config. */
async function html(source: string, format: 'md' | 'mdx', config = defineDocsConfig()) {
  const preset = config.mdxOptions
  if (typeof preset === 'function') throw new Error('expected the options')
  const options = await applyMdxPreset(preset)('runtime')
  const { default: Content } = await evaluate(source, { ...options, ...runtime, format })
  return renderToStaticMarkup(createElement(Content))
}

describe('defineDocsConfig', () => {
  // ADR 0046 (F5, W7): left to MDX, `.md` drops raw HTML, text and all, without an error.
  it('shows raw HTML in .md as text', async () => {
    expect(await html('Run `/review` with <name> as the plugin.', 'md')).toBe(
      '<p>Run <code>/review</code> with &lt;name&gt; as the plugin.</p>',
    )
  })

  it('shows a block of raw HTML in .md as text', async () => {
    expect(await html('<details>\n<summary>More</summary>\n\nBody', 'md')).toBe(
      '&lt;details&gt;\n&lt;summary&gt;More&lt;/summary&gt;\n<p>Body</p>',
    )
  })

  it('drops HTML comments in .md', async () => {
    expect(await html('report <!-- a secret --> contains\n\n<!-- a note -->\n\nText', 'md')).toBe(
      '<p>report  contains</p>\n\n<p>Text</p>',
    )
  })

  it('leaves .mdx as MDX', async () => {
    expect(await html('A <strong>bold</strong> claim {/* a note */}', 'mdx')).toBe(
      '<p>A <strong>bold</strong> claim </p>',
    )
  })

  it("turns Fumadocs' own Shiki pass off", async () => {
    expect(await html('```ts\nconst a = 1\n```', 'md')).toBe(
      '<pre><code class="language-ts">const a = 1\n</code></pre>',
    )
  })

  it("keeps a fence's title for the code block, after the site's remark steps", async () => {
    const seen: (string | undefined)[] = []
    const site = () => (tree: { children: { meta?: string }[] }) => {
      seen.push(tree.children[0]?.meta)
    }
    for (const remarkPlugins of [[site], () => [site]]) {
      const config = defineDocsConfig({ remarkPlugins })
      expect(await html('```ts title="a.ts"\nconst a = 1\n```', 'md', config)).toBe(
        '<pre><code class="language-ts" data-title="a.ts">const a = 1\n</code></pre>',
      )
    }
    expect(seen).toEqual(['title="a.ts"', 'title="a.ts"'])
  })

  describe.each([
    ['a list', (plugin: () => (tree: Node) => void) => [plugin]],
    ['a function', (plugin: () => (tree: Node) => void) => () => [plugin]],
  ])("the site's rehype plugins, given as %s", (_kind, given) => {
    it('run after it, so they see no raw HTML', async () => {
      const seen: string[] = []
      const visit = (node: Node) => {
        seen.push(node.type)
        node.children?.forEach(visit)
      }
      const config = defineDocsConfig({ rehypePlugins: given(() => visit) })
      expect(await html('Use <b>', 'md', config)).toBe('<p>Use &lt;b&gt;</p>')
      expect(seen).toContain('text')
      expect(seen).not.toContain('raw')
    })
  })
})

describe('defineDocsCollections', () => {
  const page = { title: 'Button', exports: ['Button'], kind: 'component' }

  it('reads the hand-written and generated pages from their folders', () => {
    const { docs, generated } = defineDocsCollections()
    expect([docs.dir, generated.dir]).toEqual([DEFAULT_CONTENT_DIR, DEFAULT_GENERATED_DIR])
    const moved = defineDocsCollections({ contentDir: 'docs', generatedDir: '.out/pages' })
    expect([moved.docs.dir, moved.generated.dir]).toEqual(['docs', '.out/pages'])
  })

  it("keeps each page's processed Markdown for the Markdown routes", () => {
    const { docs, generated } = defineDocsCollections()
    for (const collection of [docs, generated]) {
      expect(collection.docs.postprocess).toEqual({
        includeProcessedMarkdown: { headingIds: false },
      })
    }
  })

  // ADR 0046 (W9): a field the collection schema doesn't declare is stripped.
  it("strips the fields the schema doesn't declare", () => {
    const { docs } = defineDocsCollections()
    expect(z.parse(docs.docs.schema as z.ZodType, page)).toEqual({ title: 'Button' })
  })

  it("keeps the site's own fields through the schema hook, in both collections", () => {
    const { docs, generated } = defineDocsCollections({
      schema: (base) => base.extend({ exports: z.array(z.string()).optional() }),
    })
    for (const collection of [docs, generated]) {
      expect(z.parse(collection.docs.schema as z.ZodType, page)).toEqual({
        title: 'Button',
        exports: ['Button'],
      })
    }
  })

  it('still requires a title', () => {
    const { docs } = defineDocsCollections({
      schema: (base) => base.extend({ kind: z.string() }),
    })
    expect(() => z.parse(docs.docs.schema as z.ZodType, { kind: 'skill' })).toThrow()
  })
})
