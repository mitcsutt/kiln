import { notFound } from 'next/navigation'
import { pageMarkdown } from '@/lib/markdown'
import { source } from '@/lib/source'

export const dynamic = 'force-static'

/** The docs index's Markdown, as a file name no page slug can take (an `index.mdx` has none). */
const INDEX = 'index.md'

/**
 * Each page's Markdown at `/llms.mdx/<page>.md`, and the index at `/llms.mdx/index.md`. The
 * `.md` keeps a page's file apart from the folder its children are written to in the static
 * export. The build copies them to `/docs/<page>.md` and `/docs.md`
 * (scripts/markdown-files.ts), and `next dev` rewrites to them (next.config.js).
 */
export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }) {
  const { slug } = await params
  const last = slug.at(-1)
  if (!last?.endsWith('.md')) notFound()
  const page = source.getPage(
    slug.length === 1 && last === INDEX ? [] : [...slug.slice(0, -1), last.slice(0, -'.md'.length)],
  )
  if (!page) notFound()
  return new Response(await pageMarkdown(page), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}

export function generateStaticParams() {
  return source.getPages().map((page) => ({
    slug: page.slugs.length
      ? [...page.slugs.slice(0, -1), `${String(page.slugs.at(-1))}.md`]
      : [INDEX],
  }))
}
