import { createFileRoute } from '@tanstack/react-router'

import { Schedule } from '#features/firings/pages/Schedule'

export const Route = createFileRoute('/firings/schedule')({ component: Schedule })
