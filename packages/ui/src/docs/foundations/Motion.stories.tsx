import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { Button } from '#components/actions/Button'
import { Stack } from '#components/layout/Stack'
import { Code } from '#components/typography/Code'
import { Text } from '#components/typography/Text'
import styles from './Foundations.module.css'

const meta = {
  title: 'UI/Foundations/Motion',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const durations = ['--dur-1', '--dur-2', '--dur-3'] as const
const easings = ['--ease-out', '--ease-in-out', '--ease-spring'] as const

function Tracks({ rows }: { rows: readonly { label: string; duration: string; ease: string }[] }) {
  const [moved, setMoved] = useState(false)
  return (
    <Stack gap={5}>
      <div>
        <Button
          variant="outline"
          tone="neutral"
          aria-pressed={moved}
          onClick={() => {
            setMoved(!moved)
          }}
        >
          Move to the end
        </Button>
      </div>
      <Stack gap={0}>
        {rows.map((row) => (
          <div key={row.label} className={styles.row}>
            <span className={styles.tokenName}>{row.label}</span>
            <div className={styles.track}>
              <div
                className={styles.puck}
                data-moved={moved || undefined}
                style={{ transitionDuration: row.duration, transitionTimingFunction: row.ease }}
              />
            </div>
          </div>
        ))}
      </Stack>
      <Text size="sm" tone="muted">
        Durations scale with the theme&apos;s <Code>--motion-scale</Code> and collapse to 1ms when
        the reader prefers reduced motion.
      </Text>
    </Stack>
  )
}

/** Three durations: a quick acknowledgement, a state change, and a panel opening. */
export const Durations: Story = {
  render: () => (
    <Tracks
      rows={durations.map((d) => ({ label: d, duration: `var(${d})`, ease: 'var(--ease-out)' }))}
    />
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(canvasElement)
    const toggle = canvas.getByRole('button', { name: 'Move to the end' })
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
  },
}

/** The theme's easings, all at `--dur-3`. Paper's spring doesn't bounce; Fiesta's does. */
export const Easings: Story = {
  render: () => (
    <Tracks
      rows={easings.map((e) => ({ label: e, duration: 'var(--dur-3)', ease: `var(${e})` }))}
    />
  ),
}
