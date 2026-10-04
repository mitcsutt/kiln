import type { Meta, StoryObj } from '@storybook/react-vite'
import { CheckboxField } from '#components/inputs/CheckboxField'
import { RadioGroupField } from '#components/inputs/RadioGroupField'
import { TextField } from '#components/inputs/TextField'
import { Container } from '#components/layout/Container'
import { Stack } from '#components/layout/Stack'
import { Fieldset } from './Fieldset'

const meta = {
  title: 'UI/Inputs/Fieldset',
  component: Fieldset,
  args: {
    legend: 'Notify me about',
    description: 'Sent to kofi@example.com. Turn these off any time.',
    error: '',
    required: false,
    disabled: false,
    variant: 'default',
    layout: 'stack',
  },
  argTypes: {
    variant: { control: 'inline-radio', options: ['default', 'section'] },
    layout: { control: 'inline-radio', options: ['stack', 'horizontal', 'inline'] },
  },
  render: (args) => (
    <Fieldset {...args}>
      <CheckboxField label="Kick-off for my club" defaultChecked />
      <CheckboxField label="Goals and red cards" defaultChecked />
      <CheckboxField label="Weekly table recap" description="Monday mornings." />
    </Fieldset>
  ),
} satisfies Meta<typeof Fieldset>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = {
  args: { error: 'Choose at least one', required: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}

/**
 * `variant="section"` for a form split into groups of fields: the legend is a small
 * heading over a hairline, so "Your details" never reads like one more field label.
 * The checkbox group inside keeps the default, label-like legend.
 */
export const Sections: Story = {
  render: () => (
    <Container width="narrow" gutter={false}>
      <Stack as="form" gap={8}>
        <Fieldset
          variant="section"
          legend="Your details"
          description="Shown to the other seven clubs on the table."
        >
          <TextField label="Display name" defaultValue="Kofi" required />
          <TextField label="Email" type="email" defaultValue="kofi@example.com" required />
        </Fieldset>
        <Fieldset variant="section" legend="Plan" optional>
          <TextField label="Amount" numeric leading="$" trailing="AUD" defaultValue="50.00" />
          <Fieldset legend="Notify me about">
            <CheckboxField label="Kick-off for my club" defaultChecked />
            <CheckboxField label="Weekly table recap" />
          </Fieldset>
        </Fieldset>
      </Stack>
    </Container>
  ),
}

/**
 * `layout="horizontal"` matches a horizontal `Field`: legend in the label column, the group
 * in the control column from `sm` up, so a group lines up with the label-left rows around it.
 * Below `sm` everything stacks.
 */
export const Horizontal: Story = {
  render: () => (
    <Container width="text" gutter={false}>
      <Stack as="form" gap={5}>
        <TextField layout="horizontal" label="Display name" defaultValue="Kofi" />
        <RadioGroupField
          layout="horizontal"
          label="Plan"
          description="Billed monthly. Change or cancel any time."
          defaultValue="20"
          options={[
            { value: '10', label: '$10' },
            { value: '20', label: '$20' },
            { value: '50', label: '$50' },
          ]}
        />
        <Fieldset layout="horizontal" legend="Notify me about">
          <CheckboxField label="Kick-off for teams I own" defaultChecked />
          <CheckboxField label="Weekly standings recap" />
        </Fieldset>
      </Stack>
    </Container>
  ),
}
