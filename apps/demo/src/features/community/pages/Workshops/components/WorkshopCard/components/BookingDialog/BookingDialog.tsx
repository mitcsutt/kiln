import { ErrorSummary, Form, FormSubmitError, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Button, Dialog, Stack, toast } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { z } from 'zod'

import { bookWorkshop, type Workshop } from '#features/community/data/workshops'

interface Booking {
  name: string
  email: string
  confidence: number | null
}

const schema = z.object({
  name: z.string().trim().min(1, 'Enter your name'),
  email: z.email('Enter an email address like mei@example.com'),
  confidence: z
    .number({ error: 'Rate yourself, one star is fine' })
    .nullable()
    .refine((value) => value !== null, 'Rate yourself, one star is fine'),
})

/** Books a place. A full workshop fails on the server, the way it would for real. */
export function BookingDialog({ workshop }: { workshop: Workshop }) {
  const [open, setOpen] = useState(false)
  const full = workshop.booked >= workshop.spaces
  const form = useAppForm<Booking>({
    defaultValues: { name: '', email: '', confidence: null },
    schema,
    afterSubmit: 'reset',
    onSubmit: async ({ value }) => {
      try {
        const reference = await bookWorkshop(
          { workshopId: workshop.id, name: value.name, email: value.email },
          workshop,
        )
        setOpen(false)
        toast({
          title: 'You are booked in',
          description: `Reference ${reference}`,
          tone: 'positive',
        })
      } catch (error) {
        throw new FormSubmitError({
          form: error instanceof Error ? error.message : 'Booking failed',
        })
      }
    },
  })
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button variant={full ? 'outline' : 'solid'}>{full ? 'Try anyway' : 'Book a place'}</Button>
      </Dialog.Trigger>
      <Dialog.Content
        size="sm"
        title={workshop.title}
        description={`With ${workshop.host}. Clay, tools and two firings included.`}
      >
        <Form form={form} aria-label={`Book ${workshop.title}`}>
          <Stack gap={4}>
            <ErrorSummary />
            <form.TextField name="name" label="Name" autoComplete="name" required />
            <form.TextField name="email" label="Email" type="email" autoComplete="email" required />
            <form.RatingField
              name="confidence"
              label="How confident are you on the wheel?"
              description="So the host can pair you up"
            />
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="ghost" tone="neutral">
                  Cancel
                </Button>
              </Dialog.Close>
              <SubmitButton>Book</SubmitButton>
            </Dialog.Footer>
          </Stack>
        </Form>
      </Dialog.Content>
    </Dialog>
  )
}
