import { createFileRoute } from '@tanstack/react-router'

import { PageSkeleton } from '#components/PageSkeleton'
import { fetchMembers } from '#features/studio/data/members'
import { Members } from '#features/studio/pages/Members'

export const Route = createFileRoute('/studio/')({
  loader: () => fetchMembers(),
  pendingComponent: PageSkeleton,
  component: MembersRoute,
})

function MembersRoute() {
  return <Members members={Route.useLoaderData()} />
}
