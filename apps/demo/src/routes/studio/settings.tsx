import { createFileRoute } from '@tanstack/react-router'

import { PageSkeleton } from '#components/PageSkeleton'
import { fetchStudioSettings } from '#features/studio/data/members'
import { Settings } from '#features/studio/pages/Settings'

export const Route = createFileRoute('/studio/settings')({
  loader: () => fetchStudioSettings(),
  pendingComponent: PageSkeleton,
  component: SettingsRoute,
})

function SettingsRoute() {
  return <Settings settings={Route.useLoaderData()} />
}
