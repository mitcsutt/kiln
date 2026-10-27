import { createFileRoute } from '@tanstack/react-router'

import { PageSkeleton } from '#components/PageSkeleton'
import { Books } from '#features/books/pages/Books'
import { fetchLedger } from '#features/books/data/ledger'

export const Route = createFileRoute('/books/')({
  loader: () => fetchLedger(),
  pendingComponent: PageSkeleton,
  component: BooksRoute,
})

function BooksRoute() {
  return <Books ledger={Route.useLoaderData()} />
}
