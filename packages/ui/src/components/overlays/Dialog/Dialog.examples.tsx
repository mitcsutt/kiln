import { Button, Dialog, Stack, TextField } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  return (
    <Dialog>
      <Dialog.Trigger asChild>
        <Button variant="outline" tone="critical">
          Cancel booking
        </Button>
      </Dialog.Trigger>
      <Dialog.Content
        size="sm"
        title="Cancel your booking?"
        description="Ferry to Kelso Bay, 07:10 tomorrow. You'll be refunded £4.20 to your card."
      >
        <Dialog.Footer>
          <Dialog.Close asChild>
            <Button variant="ghost" tone="neutral">
              Keep booking
            </Button>
          </Dialog.Close>
          <Dialog.Close asChild>
            <Button tone="critical">Cancel booking</Button>
          </Dialog.Close>
        </Dialog.Footer>
      </Dialog.Content>
    </Dialog>
  )
}

export function Form() {
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
