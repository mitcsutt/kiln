import type { Meta, StoryObj } from '@storybook/react-vite'
import { Fieldset } from '#components/inputs/Fieldset'
import { RadioGroup } from './RadioGroup'

const meta = {
  title: 'UI/Inputs/RadioGroup',
  component: RadioGroup,
  args: {
    'aria-label': 'Billing period',
    defaultValue: 'fortnightly',
    orientation: 'vertical',
    size: 'md',
    invalid: false,
    disabled: false,
  },
  render: (args) => (
    <RadioGroup {...args}>
      <RadioGroup.Item value="weekly" label="Weekly" />
      <RadioGroup.Item value="fortnightly" label="Fortnightly" />
      <RadioGroup.Item value="monthly" label="Monthly" />
    </RadioGroup>
  ),
} satisfies Meta<typeof RadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Horizontal: Story = {
  args: { orientation: 'horizontal' },
}

/** Descriptions hang under their label; the radio centres on the first line. */
export const WithDescriptions: Story = {
  render: () => (
    <Fieldset legend="Who can see the project board?">
      <RadioGroup defaultValue="private">
        <RadioGroup.Item
          value="private"
          label="Private link"
          description="Only the eight team members with a sign-in link can see it."
        />
        <RadioGroup.Item
          value="public"
          label="Public page"
          description="Anyone with the address can follow progress. Comments stay private."
        />
        <RadioGroup.Item
          value="archive"
          label="Archive after launch"
          description="Available once the project closes on 19 July."
          disabled
        />
      </RadioGroup>
    </Fieldset>
  ),
}

export const Invalid: Story = {
  render: () => (
    <Fieldset legend="Plan" error="Choose a plan">
      <RadioGroup orientation="horizontal" invalid>
        <RadioGroup.Item value="10" label="$10" />
        <RadioGroup.Item value="20" label="$20" />
        <RadioGroup.Item value="50" label="$50" />
      </RadioGroup>
    </Fieldset>
  ),
}
