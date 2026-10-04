import { notFound } from 'next/navigation'
import { pageMarkdown } from '@/lib/markdown'
import { source } from '@/lib/source'

export const dynamic = 'force-static'

/** Served at `/docs/<page>.md` through the rewrite in next.config.js. */
export async function GET(_request: Request, { params }: { params: Promise<{ slug?: string[] }> }) {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()
  return new Response(await pageMarkdown(page), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}

export function generateStaticParams() {
  return source.generateParams()
}
