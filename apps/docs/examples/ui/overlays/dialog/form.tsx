'use client'

import { Button, Dialog, Stack, TextField } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export default function Form() {
  const [open, setOpen] = useState(false)
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button>Rename route</Button>
      </Dialog.Trigger>
      <Dialog.Content title="Rename route">
        <form
          onSubmit={(event) => {
            event.preventDefault()
            setOpen(false)
          }}
        >
          <Stack gap={5}>
            <TextField label="Route name" defaultValue="Morning commute" />
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="ghost" tone="neutral">
                  Cancel
                </Button>
              </Dialog.Close>
              <Button type="submit">Save name</Button>
            </Dialog.Footer>
          </Stack>
        </form>
      </Dialog.Content>
    </Dialog>
  )
}
