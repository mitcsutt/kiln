import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormOneTimeCodeField } from './FormOneTimeCodeField'

const meta = {
  title: 'Forms/Fields/OneTimeCodeField',
  component: FormOneTimeCodeField,
  args: { label: 'Verification code' },
} satisfies Meta<typeof FormOneTimeCodeField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: '' }} label="Confirm sign-in">
      {(form) => (
        <form.OneTimeCodeField
          name="value"
          label="Verification code"
          description="Sent by text to 0491 570 156"
          length={6}
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
                <form.OneTimeCodeField name="value" label="Verification code" length={6} />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: '' }}>
              {(form) => (
                <form.OneTimeCodeField
                  name="value"
                  label="Verification code"
                  description="Sent by text to 0491 570 156"
                  length={6}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: '482913' }} reveal>
              {(form) => (
                <form.OneTimeCodeField
                  name="value"
                  label="Verification code"
                  length={6}
                  validators={{ onDynamic: () => 'That code has expired. We sent a new one.' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: '482913' }} reveal>
              {(form) => (
                <form.OneTimeCodeField
                  name="value"
                  label="Verification code"
                  length={6}
                  warn={() => 'This code expires in under a minute'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: '482913' }}>
              {(form) => (
                <form.OneTimeCodeField name="value" label="Verification code" length={6} disabled />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: '482913' }}>
              {(form) => (
                <form.OneTimeCodeField name="value" label="Verification code" length={6} readOnly />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: '482913' }} reveal>
              {(form) => (
                <form.OneTimeCodeField
                  name="value"
                  label="Verification code"
                  length={6}
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
    <StoryForm defaultValues={{ code: '' }} label="Confirm sign-in" submitLabel="Confirm">
      {(form) => (
        <form.OneTimeCodeField
          name="code"
          label="Verification code"
          description="Sent by text to 0491 570 156"
          length={6}
          required
        />
      )}
    </StoryForm>
  ),
}

export const ViewMode: Story = {
  name: 'View mode',
  render: () => (
    <FieldDemo defaultValues={{ value: '482913' }} mode="view" label="Verification code">
      {(form) => <form.OneTimeCodeField name="value" label="Verification code" length={6} />}
    </FieldDemo>
  ),
}
