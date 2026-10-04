import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button, Heading, Inline, Stack, Text, type FileValue } from '@mitcsutt/kiln-ui'
import { Form, FormStatus, SubmitButton } from '#components'
import { useAutosave } from '#core/hooks'
import { kit, useFields } from '#kit'
import { FormActions, FormAside, FormRows } from '#layouts'
import { recipeParameters } from '#stories/recipes/parameters'
import { RecipeFrame } from '#stories/recipes/RecipeFrame'

/*
 * Recipe: Account settings — the settings page of a small team workspace. Sections sit in a
 * label column (FormAside). Profile and notifications save themselves as you go and report it in
 * the header; the password lives in its own form with an explicit button, because a half-typed
 * password should never autosave.
 */

interface Settings {
  name: string
  email: string
  avatar: readonly FileValue[]
  mentions: boolean
  signIns: boolean
  digest: boolean
  digestDay: string | null
}

interface PasswordChange {
  current: string
  password: { next: string; confirm: string }
}

const settings: Settings = {
  name: 'Imogen Hale',
  email: 'imogen.hale@example.com',
  avatar: [{ id: 'avatar-1', name: 'imogen-hale.jpg', size: 184_320, type: 'image/jpeg' }],
  mentions: true,
  signIns: false,
  digest: true,
  digestDay: 'monday',
}

const wait = (ms: number, signal: AbortSignal) =>
  new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(signal.reason instanceof Error ? signal.reason : new Error('Aborted'))
    })
  })

/** A new password typed twice: one reusable field group, bound wherever a form has `{ next, confirm }`. */
const PasswordPair = kit.withFieldGroup({
  defaultValues: { next: '', confirm: '' },
  render: function PasswordPair({ group }) {
    const fields = useFields(group)
    return (
      <>
        <fields.PasswordField
          name="next"
          label="New password"
          description="At least 12 characters. A phrase you'll remember beats symbols you won't."
          autoComplete="new-password"
          required
          validators={{
            onDynamic: ({ value }) =>
              value.length < 12 ? 'Use at least 12 characters' : undefined,
          }}
        />
        <fields.PasswordField
          name="confirm"
          label="Type it again"
          autoComplete="new-password"
          required
          validators={{
            onChangeListenTo: ['next'],
            onDynamic: ({ value }) =>
              value !== group.getFieldValue('next') ? "The two passwords don't match" : undefined,
          }}
        />
      </>
    )
  },
})

function PasswordForm() {
  const form = kit.useAppForm<PasswordChange>({
    defaultValues: { current: '', password: { next: '', confirm: '' } },
    afterSubmit: 'reset',
    onSubmit: () => new Promise((resolve) => setTimeout(resolve, 700)),
  })
  return (
    <Form form={form} aria-label="Change password">
      <FormAside
        headingLevel={2}
        title="Password"
        description="Changing it signs you out everywhere else: the laptop, the phone, the shared tablet."
      >
        <form.PasswordField
          name="current"
          label="Current password"
          autoComplete="current-password"
          required
          validators={{
            onDynamic: ({ value }) => (value === '' ? 'Enter your current password' : undefined),
          }}
        />
        <PasswordPair form={form} fields="password" />
        <FormActions align="end">
          <SubmitButton>Update password</SubmitButton>
        </FormActions>
      </FormAside>
    </Form>
  )
}

function SettingsScreen({ failSaves = false }: { failSaves?: boolean }) {
  const form = kit.useAppForm<Settings>({ defaultValues: settings })
  useAutosave(
    form,
    async (_values, { signal }) => {
      await wait(900, signal)
      if (failSaves) throw new Error('Network unreachable')
    },
    { debounceMs: 700 },
  )

  return (
    <Stack gap={9}>
      <Inline gap={4} justify="between" align="end">
        <Stack gap={1}>
          <Heading level={1} size="display-sm">
            Settings
          </Heading>
          <Text tone="muted">Changes save as you make them.</Text>
        </Stack>
        <FormStatus form={form} />
      </Inline>

      <Stack gap={9} dividers>
        <Form form={form} aria-label="Profile and notifications">
          <Stack gap={9} dividers>
            <FormAside
              headingLevel={2}
              title="Profile"
              description="Shown to everyone in the workspace, next to your comments and files."
            >
              <form.TextField
                name="name"
                label="Name"
                autoComplete="name"
                validators={{
                  onDynamic: ({ value }) =>
                    value.trim() === '' ? 'Your name is shown next to your work' : undefined,
                }}
              />
              <form.TextField
                name="email"
                label="Email"
                type="email"
                description="Sign-in links and notifications go to this address."
                validators={{
                  onDynamic: ({ value }) =>
                    /.+@.+\..+/.test(value) ? undefined : 'Check the email address',
                }}
              />
              <form.FileField
                name="avatar"
                label="Portrait"
                description="Square, JPG or PNG, up to 2 MB."
                accept="image/jpeg,image/png"
                maxFiles={1}
                maxSize={2 * 1024 * 1024}
              />
            </FormAside>
            <FormAside
              headingLevel={2}
              title="Notifications"
              description="Email only. Nothing is ever sent to the phone."
            >
              <FormRows>
                <form.SwitchField
                  name="mentions"
                  label="Mentions and replies"
                  description="When someone mentions you or replies to your comment."
                />
                <form.SwitchField name="signIns" label="Sign-ins from a new device" />
                <form.SwitchField
                  name="digest"
                  label="Weekly digest"
                  description="What changed in your projects, one email."
                />
                <form.SelectField
                  name="digestDay"
                  label="Digest arrives"
                  options={[
                    { value: 'monday', label: 'Monday morning' },
                    { value: 'friday', label: 'Friday afternoon' },
                  ]}
                />
              </FormRows>
            </FormAside>
          </Stack>
        </Form>

        <PasswordForm />

        <FormAside
          headingLevel={2}
          title="Delete account"
          description="Removes your workspace, its 6 projects and 214 uploaded files."
        >
          <Stack gap={4}>
            <Text measure="text">
              Your billing history stays available for 90 days. Export your files first: once
              deleted they can&apos;t be recovered, by you or by our support team.
            </Text>
            <Inline gap={3} justify="start">
              <Button tone="neutral" variant="outline">
                Export files
              </Button>
              <Button tone="critical" variant="outline">
                Delete account
              </Button>
            </Inline>
          </Stack>
        </FormAside>
      </Stack>
    </Stack>
  )
}

const meta = {
  title: 'Forms/Getting started/Account settings',
  parameters: recipeParameters,
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Change any profile field or switch: the header reads "Unsaved changes", then "Saving…", then "Saved". */
export const Autosave: Story = {
  render: () => (
    <RecipeFrame theme="monograph">
      <SettingsScreen />
    </RecipeFrame>
  ),
}

/** The save endpoint is down: the header reports the failure and the changes stay dirty. */
export const SaveFails: Story = {
  name: 'Save fails',
  render: () => (
    <RecipeFrame theme="monograph">
      <SettingsScreen failSaves />
    </RecipeFrame>
  ),
}
