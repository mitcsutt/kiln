import type { Meta, StoryObj } from '@storybook/react-vite'
import { Stack } from '#components/layout/Stack'
import styles from './Foundations.module.css'

const meta = {
  title: 'UI/Foundations/Type',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const steps = [
  'display-lg',
  'display-md',
  'display-sm',
  '3xl',
  '2xl',
  'xl',
  'lg',
  'md',
  'sm',
  'xs',
  '2xs',
] as const

/** The modular scale (`--type-base × --type-ratio^n`). Display steps are fluid. */
export const Scale: Story = {
  render: () => (
    <Stack gap={0}>
      {steps.map((step) => (
        <div key={step} className={styles.row}>
          <span className={styles.tokenName}>--text-{step}</span>
          <span
            className={step.startsWith('display') ? styles.display : styles.heading}
            style={{ fontSize: `var(--text-${step})` }}
          >
            {step.startsWith('display') ? 'Tide tables' : 'The ferry leaves at a quarter past'}
          </span>
        </div>
      ))}
    </Stack>
  ),
}

/** Figures use the numeric face with tabular, lining numerals, so columns line up. */
export const Figures: Story = {
  render: () => (
    <Stack gap={3}>
      {['£4,812.40', '1,207.95', '17 tasks', '28/09/2026'].map((figure) => (
        <div key={figure} className={styles.numeric} style={{ fontSize: 'var(--text-2xl)' }}>
          {figure}
        </div>
      ))}
    </Stack>
  ),
}

/** Long-form reading: the prose face, size and leading. */
export const Prose: Story = {
  render: () => (
    <p className={styles.prose}>
      The first ferry leaves the harbour at a quarter past six and calls at every jetty on the north
      shore. On weekdays a bus meets it at the terminal; on Sundays the timetable thins out and the
      last crossing back is at half past seven.
    </p>
  ),
}
