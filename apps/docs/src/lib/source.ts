import { docs } from 'fumadocs-mdx:collections/server'
import { loader, type InferPageType } from 'fumadocs-core/source'
import { withPageOrder } from './pageOrder'

export const source = withPageOrder(
  loader({
    baseUrl: '/docs',
    source: docs.toFumadocsSource(),
  }),
)

export type DocsPageType = InferPageType<typeof source>
