import type { Meta, StoryObj } from '@storybook/react-vite'
import { rowsFixture, rowsSchema } from '#stories/fixtures/structure'
import { parityStory } from '#stories/parity'
import { StoryForm } from '#stories/_kit'
import { FormRows } from './FormRows'

const meta = {
  title: 'Forms/Layouts/FormRows',
  component: FormRows,
  args: { dividers: true, children: null },
} satisfies Meta<typeof FormRows>

export default meta
type Story = StoryObj<typeof meta>

const digests = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'never', label: 'Never' },
]

/** Settings as label-and-control rows. Try `dividers` and `gap`. */
export const Playground: Story = {
  render: (args) => (
    <StoryForm label="Notifications" defaultValues={{ eventReminders: true, digest: 'weekly' }}>
      {(form) => (
        <FormRows {...args}>
          <form.SwitchField
            name="eventReminders"
            label="Event reminders"
            description="An hour before each event starts."
          />
          <form.SelectField name="digest" label="Activity digest" options={digests} />
        </FormRows>
      )}
    </StoryForm>
  ),
}

export const ComponentAndSchema: Story = parityStory(rowsFixture, rowsSchema, ['FormRows'])
