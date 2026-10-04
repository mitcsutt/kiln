import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import { Quote } from './Quote'

const meta = {
  title: 'UI/Typography/Quote',
  component: Quote,
  args: {
    children: 'The best tools disappear. You only notice them when they are gone.',
    cite: 'Ada Okafor',
    size: 'md',
  },
} satisfies Meta<typeof Quote>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Sizes: Story = {
  render: () => (
    <Stack gap={8}>
      <Quote
        size="lg"
        cite={
          <>
            Ada Okafor
            <br />
            <span>On design systems, 2026</span>
          </>
        }
      >
        Software that stays out of the way is the hardest kind to build.
      </Quote>
      <Quote
        cite={
          <>
            Kofi
            <br />
            <span>Captain, Harbour Hawks</span>
          </>
        }
      >
        I have never cared this much about division two.
      </Quote>
      <Quote
        size="sm"
        cite={
          <>
            Amara Raman
            <br />
            <span>Engineering manager, previous team</span>
          </>
        }
      >
        Ada rebuilt our component library without a single product team having to stop shipping. Six
        months later nobody remembered the old one.
      </Quote>
    </Stack>
  ),
}
