import { createFileRoute } from '@tanstack/react-router'

import { PageSkeleton } from '#components/PageSkeleton'
import { fetchWorkshops } from '#features/community/data/workshops'
import { Workshops } from '#features/community/pages/Workshops'

export const Route = createFileRoute('/community/')({
  loader: () => fetchWorkshops(),
  pendingComponent: PageSkeleton,
  component: WorkshopsRoute,
})

function WorkshopsRoute() {
  return <Workshops workshops={Route.useLoaderData()} />
}
