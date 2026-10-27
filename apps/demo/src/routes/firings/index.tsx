import { createFileRoute } from '@tanstack/react-router'

import { PageSkeleton } from '#components/PageSkeleton'
import { fetchKilnRoom } from '#features/firings/data/kilns'
import { KilnRoom } from '#features/firings/pages/KilnRoom'

export const Route = createFileRoute('/firings/')({
  loader: () => fetchKilnRoom(),
  pendingComponent: PageSkeleton,
  component: KilnRoomRoute,
})

function KilnRoomRoute() {
  return <KilnRoom room={Route.useLoaderData()} />
}
