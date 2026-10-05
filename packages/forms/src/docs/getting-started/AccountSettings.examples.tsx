import {
  Form,
  FormActions,
  FormAside,
  FormRows,
  FormStatus,
  SubmitButton,
  useAppForm,
  useAutosave,
} from '@mitcsutt/kiln-forms'
import { Heading, Inline, Stack, Text } from '@mitcsutt/kiln-ui'

interface Profile {
  name: string
  email: string
  homeStop: string | null
  delays: boolean
  works: boolean
  digest: boolean
}

function saveProfile(_values: Profile, { signal }: { signal: AbortSignal }) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 800)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('Superseded by a newer save'))
    })
  })
}

function PasswordForm() {
  const form = useAppForm({
    defaultValues: { current: '', next: '' },
    afterSubmit: 'reset',
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 600)),
  })
  return (
    <Form form={form} aria-label="Change password">
      <FormAside
        headingLevel={3}
        title="Password"
        description="Changing it signs you out on every other device."
      >
        <form.PasswordField
          name="current"
          label="Current password"
          autoComplete="current-password"
          required
        />
        <form.PasswordField
          name="next"
          label="New password"
          autoComplete="new-password"
          required
          validators={{
            onDynamic: ({ value }) =>
              value.length < 12 ? 'Use at least 12 characters' : undefined,
          }}
        />
        <FormActions>
          <SubmitButton>Update password</SubmitButton>
        </FormActions>
      </FormAside>
    </Form>
  )
}

export function Usage() {
  const form = useAppForm<Profile>({
    defaultValues: {
      name: 'Ines Varga',
      email: 'ines@example.com',
      homeStop: 'harbour',
      delays: true,
      works: false,
      digest: true,
    },
  })
  useAutosave(form, saveProfile, { debounceMs: 700 })
  return (
    <Stack gap={8}>
      <Inline justify="between" align="end">
        <Stack gap={1}>
          <Heading level={2} size="2xl">
            Settings
          </Heading>
          <Text tone="muted">Changes save as you make them.</Text>
        </Stack>
        <FormStatus form={form} />
      </Inline>
      <Form form={form} aria-label="Profile and alerts">
        <Stack gap={8} dividers>
          <FormAside
            headingLevel={3}
            title="Profile"
            description="Shown on your passes and receipts."
          >
            <form.TextField
              name="name"
              label="Name"
              autoComplete="name"
              validators={{
                onDynamic: ({ value }) =>
                  value.trim() ? undefined : 'Your name goes on your pass',
              }}
            />
            <form.TextField name="email" label="Email" type="email" autoComplete="email" />
            <form.SelectField
              name="homeStop"
              label="Home stop"
              options={[
                { value: 'harbour', label: 'Harbour Square' },
                { value: 'kelso', label: 'Kelso Bay Pier' },
              ]}
            />
          </FormAside>
          <FormAside
            headingLevel={3}
            title="Alerts"
            description="Sent by email. Nothing goes to your phone."
          >
            <FormRows>
              <form.SwitchField name="delays" label="Delays on saved routes" />
              <form.SwitchField name="works" label="Planned works" />
              <form.SwitchField
                name="digest"
                label="Weekly summary"
                description="Your trips and receipts, one email."
              />
            </FormRows>
          </FormAside>
        </Stack>
      </Form>
      <PasswordForm />
    </Stack>
  )
}
