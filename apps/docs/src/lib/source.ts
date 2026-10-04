import { docs } from 'fumadocs-mdx:collections/server'
import { loader, type InferPageType } from 'fumadocs-core/source'

export const source = loader({
  baseUrl: '/docs',
  source: docs.toFumadocsSource(),
})

export type DocsPageType = InferPageType<typeof source>
