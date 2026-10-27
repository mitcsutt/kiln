import { createFileRoute } from '@tanstack/react-router'

import { OpenStudio } from '#features/community/pages/OpenStudio'

export const Route = createFileRoute('/community/plan')({ component: OpenStudio })
