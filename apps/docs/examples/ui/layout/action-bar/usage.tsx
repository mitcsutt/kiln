'use client'

import { ActionBar, Button, Stack, TextField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Stack gap={5}>
      <TextField label="Route name" defaultValue="Morning commute" />
      <ActionBar>
        <Button variant="ghost" tone="neutral">
          Cancel
        </Button>
        <Button>Save route</Button>
      </ActionBar>
      <ActionBar align="between">
        <Button variant="outline" tone="critical">
          Delete route
        </Button>
        <Button>Save route</Button>
      </ActionBar>
    </Stack>
  )
}
