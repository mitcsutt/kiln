import { createDocsPage } from '@mitcsutt/kiln-docs/docs-page'
import { getMDXComponents } from '@/components/mdx'
import { site } from '@/lib/site'

export const { generateStaticParams, generateMetadata } = site

// Kiln's own MDX components, imported by this route alone so their CSS loads with the page.
export default createDocsPage(site, { components: getMDXComponents() })
