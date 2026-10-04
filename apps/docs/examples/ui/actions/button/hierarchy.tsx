'use client'

import { Button, Inline } from '@mitcsutt/kiln-ui'

export default function Hierarchy() {
  return (
    <Inline gap={3}>
      <Button>Publish timetable</Button>
      <Button variant="outline" tone="neutral">
        Export CSV
      </Button>
      <Button variant="ghost" tone="neutral">
        Cancel
      </Button>
    </Inline>
  )
}
