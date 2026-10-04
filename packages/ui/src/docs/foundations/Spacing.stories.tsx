import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import styles from './Foundations.module.css'

const meta = {
  title: 'UI/Foundations/Spacing',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** The non-linear space scale, multiplied by the theme's density. Props take the step: `gap={5}`. */
export const Scale: Story = {
  render: () => (
    <Stack gap={0}>
      {Array.from({ length: 12 }, (_, i) => i + 1).map((n) => (
        <div key={n} className={styles.row}>
          <span className={styles.tokenName}>--space-{n}</span>
          <div className={styles.bar} style={{ inlineSize: `var(--space-${String(n)})` }} />
        </div>
      ))}
    </Stack>
  ),
}

/** Control heights, also scaled by density, so a row of mixed controls lines up. */
export const Controls: Story = {
  render: () => (
    <Stack gap={0}>
      {(['sm', 'md', 'lg'] as const).map((size) => (
        <div key={size} className={styles.row}>
          <span className={styles.tokenName}>--control-{size}</span>
          <div className={styles.bar} style={{ blockSize: `var(--control-${size})` }} />
        </div>
      ))}
    </Stack>
  ),
}

/** Content widths, from a narrow form column to a wide dashboard. */
export const Widths: Story = {
  render: () => (
    <Stack gap={0}>
      {(['narrow', 'text', 'content', 'wide'] as const).map((width) => (
        <div key={width} className={styles.row}>
          <span className={styles.tokenName}>--width-{width}</span>
          <div className={styles.bar} style={{ inlineSize: `min(100%, var(--width-${width}))` }} />
        </div>
      ))}
    </Stack>
  ),
}
