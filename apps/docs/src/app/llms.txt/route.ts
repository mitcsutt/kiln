import { markdown } from '@/lib/siteMarkdown'

export const dynamic = 'force-static'

export function GET() {
  return new Response(markdown.llmsIndex(), {
    headers: { 'Content-Type': 'text/markdown; charset=utf-8' },
  })
}
