import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, userEvent, within } from 'storybook/test'
import { whenFixture, whenSchema } from '#stories/fixtures/flow'
import { StoryForm, storyRoot } from '#stories/_kit'
import { parityStory } from '#stories/parity'
import { When } from './When'

// `When` is generic over the form, so the meta names no `component`.
const meta = {
  title: 'Forms/Layouts/When',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const methods = [
  { value: 'delivery', label: 'Delivery' },
  { value: 'pickup', label: 'Collect from the shop' },
]

/** Choose "Collect from the shop": the address field unmounts and the collection time appears. */
export const Playground: Story = {
  render: () => (
    <StoryForm label="Order" defaultValues={{ method: 'delivery', address: '', pickupTime: '' }}>
      {(form) => (
        <>
          <form.RadioField name="method" label="How do you want your order?" options={methods} />
          <When form={form} is={(values) => values.method === 'delivery'}>
            <form.TextareaField name="address" label="Delivery address" />
          </When>
          <When form={form} is={(values) => values.method === 'pickup'}>
            <form.TimeField name="pickupTime" label="Collection time" />
          </When>
        </>
      )}
    </StoryForm>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await expect(canvas.getByLabelText('Delivery address')).toBeInTheDocument()
    await userEvent.click(canvas.getByRole('radio', { name: 'Collect from the shop' }))
    await expect(canvas.queryByLabelText('Delivery address')).not.toBeInTheDocument()
    await expect(canvas.getByLabelText('Collection time')).toBeInTheDocument()
  },
}

/** Switch to "Collect from the shop": the address unmounts and is pruned from the output. */
export const ComponentAndSchema: Story = parityStory(whenFixture, whenSchema, ['When'])
