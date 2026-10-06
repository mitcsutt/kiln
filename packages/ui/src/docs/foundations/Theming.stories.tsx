import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { Card } from '#components/display/Card'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { Heading } from '#components/typography/Heading'
import { Text } from '#components/typography/Text'
import { ThemeScope } from '#theme'
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
      <ThemeScope theme="flightdeck" className={styles.scope}>
        <Sample title="Flightdeck, inherited mode" />
      </ThemeScope>
      <ThemeScope theme="ledger" mode="dark" className={styles.scope}>
        <Sample title="Ledger, always dark" />
      </ThemeScope>
      <ThemeScope theme="riso" className={styles.scope} data-density="compact">
        <Sample title="Riso, compact density" />
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
