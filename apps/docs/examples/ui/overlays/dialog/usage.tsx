'use client'

import { Button, Dialog } from '@mitcsutt/kiln-ui'

export default function Usage() {
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
