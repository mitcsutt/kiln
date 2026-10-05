import type { Meta, StoryObj } from '@storybook/react-vite'
import { Box, Button, Heading, Inline, Stack, Text, ThemeScope } from '@mitcsutt/kiln-ui'
import { Card } from '#components/display/Card'
import styles from './Foundations.module.css'

const meta = {
  title: 'UI/Foundations/Theming',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Sample({ title }: { title: string }) {
  return (
    <Stack gap={4}>
      <Heading level={3} size="md">
        {title}
      </Heading>
      <Text tone="muted">Ferry to the island, Saturday 09:40. Two adults, one bicycle.</Text>
      <Inline gap={3}>
        <Button size="sm">Book seats</Button>
        <Button size="sm" variant="outline" tone="neutral">
          See timetable
        </Button>
      </Inline>
    </Stack>
  )
}

/**
 * Themes are attributes, so they nest. Each scope sets its own theme, mode or density, and
 * everything inside recomputes from it (DESIGN.md §3.4).
 */
export const Scopes: Story = {
  render: () => (
    <div className={styles.scopeGrid}>
      <div className={styles.scope}>
        <Sample title="The page's own theme" />
      </div>
      <ThemeScope theme="monograph" className={styles.scope}>
        <Sample title="Monograph, inherited mode" />
      </ThemeScope>
      <ThemeScope theme="ledger" mode="dark" className={styles.scope}>
        <Sample title="Ledger, always dark" />
      </ThemeScope>
      <ThemeScope theme="fiesta" className={styles.scope} data-density="compact">
        <Sample title="Fiesta, compact density" />
      </ThemeScope>
    </div>
  ),
}

/**
 * A theme written outside Kiln: `harbour` sets a dozen tokens in its own stylesheet, and
 * any name type-checks. Tokens it leaves out fall back to Paper, so it degrades to Paper
 * rather than to unstyled. A complete theme sets every token in UI/Foundations/Tokens.
 */
export const CustomTheme: Story = {
  render: () => (
    <div className={styles.scopeGrid}>
      <ThemeScope theme="harbour" className={styles.scope}>
        <Card>
          <Card.Body>
            <Sample title="Harbour, a custom theme" />
          </Card.Body>
        </Card>
      </ThemeScope>
      <ThemeScope theme="harbour" mode="dark" className={styles.scope}>
        <Card>
          <Card.Body>
            <Sample title="Harbour, dark" />
          </Card.Body>
        </Card>
      </ThemeScope>
    </div>
  ),
}

/**
 * The Harbour theme, a stylesheet Kiln has never heard of, applied to one part of the page with
 * `ThemeScope`.
 */
export const Usage: Story = {
  tags: ['docs'],
  parameters: { layout: 'fullscreen' },
  render: function Usage() {
    return (
      <ThemeScope theme="harbour">
        <Box padding={6}>
          <Stack gap={4}>
            <Heading level={3} size="2xl">
              High water 06:42
            </Heading>
            <Text tone="muted">Next sailing to Kelso Bay boards at berth 3.</Text>
            <Inline gap={3}>
              <Button>Book a seat</Button>
              <Button variant="outline" tone="neutral">
                Tide table
              </Button>
            </Inline>
          </Stack>
        </Box>
      </ThemeScope>
    )
  },
}
