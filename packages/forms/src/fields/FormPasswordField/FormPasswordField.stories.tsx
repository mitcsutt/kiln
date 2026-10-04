import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormPasswordField } from './FormPasswordField'

const meta = {
  title: 'Forms/Fields/PasswordField',
  component: FormPasswordField,
  args: { label: 'Password', autoComplete: 'current-password' },
} satisfies Meta<typeof FormPasswordField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: '' }} label="Sign in">
      {(form) => (
        <form.PasswordField
          name="value"
          label="Password"
          autoComplete="current-password"
          required
        />
      )}
    </FieldDemo>
  ),
}

export const States: Story = {
  render: () => (
    <StatesGrid
      cells={[
        {
          title: 'Default',
          children: (
            <FieldDemo defaultValues={{ value: '' }}>
              {(form) => (
                <form.PasswordField name="value" label="New password" autoComplete="new-password" />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: '' }}>
              {(form) => (
                <form.PasswordField
                  name="value"
                  label="New password"
                  autoComplete="new-password"
                  description="At least 12 characters. A short sentence is easier to remember."
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: 'spring2026' }} reveal>
              {(form) => (
                <form.PasswordField
                  name="value"
                  label="New password"
                  autoComplete="new-password"
                  validators={{ onDynamic: () => 'Use at least 12 characters' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: 'correcthorsebattery' }} reveal>
              {(form) => (
                <form.PasswordField
                  name="value"
                  label="New password"
                  autoComplete="new-password"
                  warn={() => 'This looks like a password you use elsewhere'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: 'correcthorsebattery' }}>
              {(form) => (
                <form.PasswordField
                  name="value"
                  label="Password"
                  autoComplete="current-password"
                  disabled
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: 'correcthorsebattery' }}>
              {(form) => (
                <form.PasswordField
                  name="value"
                  label="Password"
                  autoComplete="current-password"
                  readOnly
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: 'correcthorsebattery' }} reveal>
              {(form) => (
                <form.PasswordField
                  name="value"
                  label="New password"
                  autoComplete="new-password"
                  validators={{ onDynamicAsync: () => NEVER_SETTLES }}
                />
              )}
            </FieldDemo>
          ),
        },
      ]}
    />
  ),
}

export const InAForm: Story = {
  name: 'In a form',
  render: () => (
    <StoryForm defaultValues={{ email: '', password: '' }} label="Sign in" submitLabel="Sign in">
      {(form) => (
        <>
          <form.TextField name="email" label="Email" type="email" autoComplete="email" required />
          <form.PasswordField
            name="password"
            label="Password"
            autoComplete="current-password"
            required
          />
        </>
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: 'correcthorsebattery' }} mode="view" label="Password">
      {(form) => (
        <form.PasswordField name="value" label="Password" autoComplete="current-password" />
      )}
    </FieldDemo>
  ),
}
