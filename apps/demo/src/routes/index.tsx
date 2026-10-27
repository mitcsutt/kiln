import { createFileRoute } from '@tanstack/react-router'

import { PageSkeleton } from '#components/PageSkeleton'
import { fetchBalance } from '#features/books/data/ledger'
import { fetchWorkshops } from '#features/community/data/workshops'
import { fetchKilnSummary } from '#features/firings/data/kilns'
import { Home } from '#features/overview/pages/Home'
import { fetchMembers } from '#features/studio/data/members'

export const Route = createFileRoute('/')({
  loader: async () => {
    const [balance, kilns, members, workshops] = await Promise.all([
      fetchBalance(),
      fetchKilnSummary(),
      fetchMembers(),
      fetchWorkshops(),
    ])
    return { balance, kilns, members, workshops }
  },
  pendingComponent: PageSkeleton,
  component: HomeRoute,
})

function HomeRoute() {
  return <Home data={Route.useLoaderData()} />
}
