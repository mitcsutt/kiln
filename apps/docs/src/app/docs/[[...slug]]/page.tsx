import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { DocsPage } from '@/components/page/DocsPage'
import { getMDXComponents } from '@/components/mdx'
import { source } from '@/lib/source'

interface Props {
  params: Promise<{ slug?: string[] }>
}

export default async function Page({ params }: Props) {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()
  const Mdx = page.data.body
  return (
    <DocsPage page={page} tree={source.getPageTree()}>
      <Mdx components={getMDXComponents()} />
    </DocsPage>
  )
}

export function generateStaticParams() {
  return source.generateParams()
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const page = source.getPage(slug)
  if (!page) notFound()
  return {
    title: page.data.title,
    description: page.data.description,
    alternates: { types: { 'text/markdown': `${page.url}.md` } },
  }
}
