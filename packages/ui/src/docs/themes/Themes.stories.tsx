import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { Badge } from '#components/display/Badge'
import { Card } from '#components/display/Card'
import { Stat } from '#components/display/Stat'
import { Tag } from '#components/display/Tag'
import { Alert } from '#components/feedback/Alert'
import { SwitchField } from '#components/inputs/SwitchField'
import { TextField } from '#components/inputs/TextField'
import { Box } from '#components/layout/Box'
import { Grid } from '#components/layout/Grid'
import { Inline } from '#components/layout/Inline'
import { Stack } from '#components/layout/Stack'
import { Heading } from '#components/typography/Heading'
import { Prose } from '#components/typography/Prose'
import { Text } from '#components/typography/Text'
import { THEME_META, ThemeScope, type BuiltInThemeName } from '#theme'

/*
 * UI/Themes: one specimen per built-in theme, rendered in its own ThemeScope so the
 * toolbar's theme doesn't change it (the toolbar's mode still does). Library components
 * only.
 */

const meta = {
  title: 'UI/Themes',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

function Specimen({ theme }: { theme: BuiltInThemeName }) {
  const { label, description, stylesheet } = THEME_META[theme]
  return (
    <ThemeScope theme={theme}>
      <Box padding={{ base: 5, md: 8 }}>
        <Stack gap={8}>
          <Stack gap={4}>
            <Heading level={1} size="display-md">
              {label}
            </Heading>
            <Text measure="text" size="lg">
              {description}
            </Text>
            <Text size="sm" tone="muted">
              {stylesheet
                ? `Import ${stylesheet} after the base stylesheet.`
                : 'The default theme.'}
            </Text>
          </Stack>

          <Grid minItemWidth="sm" gap={6}>
            <Card>
              <Card.Body>
                <Stack gap={5}>
                  <Heading level={2} size="md">
                    Weekend ferry
                  </Heading>
                  <TextField label="Passenger name" defaultValue="Hana Sato" />
                  <SwitchField label="Bringing a bicycle" defaultChecked />
                  <Inline gap={3}>
                    <Button>Book seats</Button>
                    <Button variant="outline" tone="neutral">
                      See timetable
                    </Button>
                  </Inline>
                </Stack>
              </Card.Body>
            </Card>
            <Stack gap={5}>
              <Stat
                size="lg"
                label="Seats left on the 09:40"
                value="23"
                delta={{ value: '8 since yesterday', direction: 'down', tone: 'critical' }}
              />
              <Inline gap={2}>
                <Badge tone="positive">On time</Badge>
                <Badge tone="caution">Busy</Badge>
                <Badge tone="critical">Cancelled</Badge>
                <Badge tone="info">New route</Badge>
              </Inline>
              <Inline gap={2}>
                <Tag color={1}>Island</Tag>
                <Tag color={2}>Point</Tag>
                <Tag color={3}>Quay</Tag>
                <Tag color={4}>Harbour</Tag>
              </Inline>
              <Alert tone="info" title="Timetable change">
                From 1 November the first crossing leaves at 07:15.
              </Alert>
            </Stack>
          </Grid>

          <Prose>
            <p>
              The crossing takes 25 minutes in calm water. Bicycles travel free on the lower deck,
              and the café opens once the ferry clears the harbour wall.
            </p>
          </Prose>
        </Stack>
      </Box>
    </ThemeScope>
  )
}

/** The neutral default: no stylesheet beyond the base one. */
export const Paper: Story = { render: () => <Specimen theme="paper" /> }

/** Dark-first: blue-slate with one ember accent and a big serif display. */
export const Monograph: Story = { render: () => <Specimen theme="monograph" /> }

/** Quiet, dense and numeric: ruled green-grey paper and tabular figures. */
export const Ledger: Story = { render: () => <Specimen theme="ledger" /> }

/** Flat spot inks, hard offsets, condensed type and springy motion. */
export const Fiesta: Story = { render: () => <Specimen theme="fiesta" /> }
