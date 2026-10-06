import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useFieldValue } from '@mitcsutt/kiln-forms'
import { Code, Stack, Text } from '@mitcsutt/kiln-ui'
import { FieldDemo, NEVER_SETTLES, StatesGrid, StoryForm } from '#stories/_kit'
import { FormComboboxField } from './FormComboboxField'

const countries = [
  { value: 'au', label: 'Australia' },
  { value: 'ca', label: 'Canada' },
  { value: 'fr', label: 'France' },
  { value: 'de', label: 'Germany' },
  { value: 'jp', label: 'Japan' },
  { value: 'nz', label: 'New Zealand' },
  { value: 'gb', label: 'United Kingdom' },
  { value: 'us', label: 'United States' },
]

const meta = {
  title: 'Forms/Fields/ComboboxField',
  component: FormComboboxField,
  args: { label: 'Country' },
} satisfies Meta<typeof FormComboboxField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {
  render: () => (
    <FieldDemo defaultValues={{ value: null as string | number | null }} label="Shipping address">
      {(form) => (
        <form.ComboboxField
          name="value"
          label="Country"
          description="Where we send your order"
          options={countries}
          placeholder="Search 8 countries"
          clearable
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
            <FieldDemo defaultValues={{ value: null as string | number | null }}>
              {(form) => (
                <form.ComboboxField
                  name="value"
                  label="Country"
                  options={countries}
                  placeholder="Search 8 countries"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'With description',
          children: (
            <FieldDemo defaultValues={{ value: null as string | number | null }}>
              {(form) => (
                <form.ComboboxField
                  name="value"
                  label="Country"
                  description="Where we send your order"
                  options={countries}
                  placeholder="Search 8 countries"
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Error',
          children: (
            <FieldDemo defaultValues={{ value: null as string | number | null }} reveal>
              {(form) => (
                <form.ComboboxField
                  name="value"
                  label="Country"
                  options={countries}
                  placeholder="Search 8 countries"
                  required
                  validators={{ onDynamic: () => 'Choose a country' }}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Warning',
          children: (
            <FieldDemo defaultValues={{ value: 'de' }} reveal>
              {(form) => (
                <form.ComboboxField
                  name="value"
                  label="Country"
                  options={countries}
                  warn={() => 'Deliveries to Germany take 5 to 7 working days'}
                />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Disabled',
          children: (
            <FieldDemo defaultValues={{ value: 'au' }}>
              {(form) => (
                <form.ComboboxField name="value" label="Country" options={countries} disabled />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Read-only',
          children: (
            <FieldDemo defaultValues={{ value: 'au' }}>
              {(form) => (
                <form.ComboboxField name="value" label="Country" options={countries} readOnly />
              )}
            </FieldDemo>
          ),
        },
        {
          title: 'Validating',
          children: (
            <FieldDemo defaultValues={{ value: 'au' }} reveal>
              {(form) => (
                <form.ComboboxField
                  name="value"
                  label="Country"
                  options={countries}
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
    <StoryForm
      defaultValues={{ name: '', country: null as string | number | null }}
      label="Shipping address"
      submitLabel="Save address"
    >
      {(form) => (
        <>
          <form.TextField name="name" label="Your name" required />
          <form.ComboboxField
            name="country"
            label="Country"
            description="Where we send your order"
            options={countries}
            placeholder="Search 8 countries"
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
    <FieldDemo defaultValues={{ value: 'au' }} mode="view" label="Country">
      {(form) => <form.ComboboxField name="value" label="Country" options={countries} />}
    </FieldDemo>
  ),
}

const STOPS = ['Harbour Square', 'Kelso Bay Pier', 'Marram Point', 'Northpoint Library', 'Old Quay']

// Called with the query, the form's values and an abort signal. Usually a fetch.
async function searchStops({ query, signal }: { query: string; signal: AbortSignal }) {
  await new Promise((resolve, reject) => {
    const timer = setTimeout(resolve, 300)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('Superseded'))
    })
  })
  return STOPS.filter((stop) => stop.toLowerCase().includes(query.toLowerCase())).map((stop) => ({
    value: stop,
    label: stop,
  }))
}

/**
 * `loadOptions` is called with the query, the form's values and an abort signal. Requests are
 * debounced, a superseded request is aborted, and results are cached per query. `reloadOn` lists
 * fields that should reload the options when they change (a region after a country). `creatable`
 * lets the reader keep text that matches no option. In schema mode, functions can't live in JSON,
 * so a loader is registered by key and referenced with `optionsFrom`.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    const form = useAppForm({ defaultValues: { stop: null as string | null } })
    const value = useFieldValue(form, 'stop')
    return (
      <Form form={form} aria-label="ComboboxField example">
        <Stack gap={4}>
          <form.ComboboxField
            name="stop"
            label="Stop"
            placeholder="Type a stop"
            loadOptions={searchStops}
            minQueryLength={1}
          />
          <Text size="sm" tone="muted">
            Value: <Code>{JSON.stringify(value)}</Code>
          </Text>
        </Stack>
      </Form>
    )
  },
}
