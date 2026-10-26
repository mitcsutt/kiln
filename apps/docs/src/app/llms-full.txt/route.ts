import { markdown } from '@/lib/siteMarkdown'

export const dynamic = 'force-static'

export async function GET() {
  return new Response(await markdown.llmsFull(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
