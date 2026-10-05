import type { Meta, StoryObj } from '@storybook/react-vite'
import { Rating, Stack } from '@mitcsutt/kiln-ui'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const meta = {
  title: 'UI/Inputs/Rating',
  component: Rating,
  args: {
    'aria-label': 'Rate this release',
    defaultValue: 4,
    max: 5,
    clearable: true,
    size: 'md',
    disabled: false,
    readOnly: false,
    invalid: false,
  },
} satisfies Meta<typeof Rating>

export default meta
type Story = StoryObj<typeof meta>

/** Each star is a radio: click one, or hold an arrow key to move and choose. */
export const Playground: Story = {
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await userEvent.click(canvas.getByRole('radio', { name: '2 of 5' }))
    await expect(canvas.getByRole('radio', { name: '2 of 5' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await userEvent.keyboard('{ArrowRight>}')
    await waitFor(() =>
      expect(canvas.getByRole('radio', { name: '3 of 5' })).toHaveAttribute('aria-checked', 'true'),
    )
    await userEvent.keyboard('{/ArrowRight}')
  },
}

export const Sizes: Story = {
  render: (args) => (
    <Stack gap={4}>
      <Rating {...args} size="sm" aria-label="Rate this release, small" />
      <Rating {...args} size="md" aria-label="Rate this release, medium" />
      <Rating {...args} size="lg" aria-label="Rate this release, large" />
    </Stack>
  ),
}

export const Unrated: Story = { args: { defaultValue: null } }

export const ReadOnly: Story = { args: { readOnly: true, defaultValue: 3 } }

export const Invalid: Story = { args: { invalid: true, defaultValue: null } }

export const Disabled: Story = { args: { disabled: true } }

/**
 * `max` sets the number of stars, and `itemLabel` names each one for screen readers.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <Stack gap={4}>
        <Rating aria-label="Rate your crossing" defaultValue={4} clearable />
        <Rating aria-label="Rate the café" defaultValue={3} max={5} size="sm" readOnly />
      </Stack>
    )
  },
}
