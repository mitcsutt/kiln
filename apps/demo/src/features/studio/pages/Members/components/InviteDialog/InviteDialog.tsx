import { ErrorSummary, Form, FormSubmitError, SubmitButton, useAppForm } from '@mitcsutt/kiln-forms'
import { Button, Dialog, PlusIcon, Stack, toast } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { z } from 'zod'

import { inviteMember, ROLE_LABELS, type Invitation } from '#features/studio/data/members'

const schema = z.object({
  name: z.string().trim().min(1, 'Enter their name'),
  email: z.email('Enter an email address like ravi@example.com'),
  role: z.enum(['potter', 'teacher', 'technician', 'volunteer'], { error: 'Choose a role' }),
  keyholder: z.boolean(),
})

/** Invites someone new. The server has the last word: a taken address comes back on the field. */
export function InviteDialog() {
  const [open, setOpen] = useState(false)
  const form = useAppForm<Invitation>({
    defaultValues: { name: '', email: '', role: null, keyholder: false },
    schema,
    afterSubmit: 'reset',
    onSubmit: async ({ value }) => {
      const result = await inviteMember(value)
      if (!result.ok) throw new FormSubmitError({ fields: { [result.field]: result.message } })
      setOpen(false)
      toast({ title: 'Invitation sent', description: value.email, tone: 'positive' })
    },
  })
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button leadingIcon={<PlusIcon />}>Invite a member</Button>
      </Dialog.Trigger>
      <Dialog.Content
        size="sm"
        title="Invite a member"
        description="They get an email to set a password. Try wren@slipcast.example to see a server error."
      >
        <Form form={form} aria-label="Invite a member">
          <Stack gap={4}>
            <ErrorSummary />
            <form.TextField name="name" label="Name" autoComplete="off" required />
            <form.TextField name="email" label="Email" type="email" required />
            <form.SelectField
              name="role"
              label="Role"
              placeholder="Choose a role"
              options={[
                { value: 'potter', label: ROLE_LABELS.potter },
                { value: 'teacher', label: ROLE_LABELS.teacher },
                { value: 'technician', label: ROLE_LABELS.technician },
                { value: 'volunteer', label: ROLE_LABELS.volunteer },
              ]}
            />
            <form.CheckboxField
              name="keyholder"
              label="Give them a key fob"
              description="Keyholders can open the studio and fire a kiln alone."
            />
            <Dialog.Footer>
              <Dialog.Close asChild>
                <Button variant="ghost" tone="neutral">
                  Cancel
                </Button>
              </Dialog.Close>
              <SubmitButton>Send invitation</SubmitButton>
            </Dialog.Footer>
          </Stack>
        </Form>
      </Dialog.Content>
    </Dialog>
  )
}
