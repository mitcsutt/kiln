import { createFromSource } from 'fumadocs-core/search/server'
import { source } from '@/lib/source'

// Exported once at build time and searched in the browser, so the site needs no server.
export const dynamic = 'force-static'

export const { staticGET: GET } = createFromSource(source)
