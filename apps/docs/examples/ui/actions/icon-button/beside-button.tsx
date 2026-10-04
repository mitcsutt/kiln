'use client'

import { Button, IconButton, Inline, MoreIcon } from '@mitcsutt/kiln-ui'

export default function BesideButton() {
  return (
    <Inline gap={2}>
      <Button>Publish timetable</Button>
      <IconButton variant="outline" label="More timetable actions" icon={<MoreIcon />} showTitle />
    </Inline>
  )
}
