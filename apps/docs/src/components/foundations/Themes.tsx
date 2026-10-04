'use client'

import {
  Alert,
  Amount,
  Badge,
  Button,
  Heading,
  Inline,
  Stack,
  Table,
  Text,
  TextField,
  THEME_META,
  THEMES,
  ThemeScope,
  type ThemeName,
} from '@mitcsutt/kiln-ui'
import styles from './Themes.module.css'

const ROWS = [
  { route: 'Harbour to Northpoint', departs: '07:15', fare: 4.2, status: 'On time' },
  { route: 'Northpoint to Kelso Bay', departs: '07:40', fare: 6.8, status: 'Delayed' },
  { route: 'Kelso Bay to Harbour', departs: '08:05', fare: 5.5, status: 'On time' },
] as const

/** A small screen built only from components: what a theme changes, and nothing else. */
function themeLabel(theme: ThemeName): string {
  return theme in THEME_META ? THEME_META[theme as keyof typeof THEME_META].label : theme
}

function Screen({ theme }: { theme: ThemeName }) {
  return (
    <Stack gap={5}>
      <Stack gap={2}>
        <Heading level={3} size="xl">
          Morning sailings
        </Heading>
        <Text size="sm" tone="muted">
          {themeLabel(theme)}: timetable for Tuesday 14 October
        </Text>
      </Stack>
      <Table density="compact" label={`Sailings in ${themeLabel(theme)}`}>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Route</Table.HeaderCell>
            <Table.HeaderCell numeric>Departs</Table.HeaderCell>
            <Table.HeaderCell numeric>Fare</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {ROWS.map((row) => (
            <Table.Row key={row.route} highlighted={row.status === 'Delayed'}>
              <Table.Cell rowHeader>
                <Inline gap={2}>
                  {row.route}
                  {row.status === 'Delayed' ? (
                    <Badge tone="caution" size="sm">
                      Delayed
                    </Badge>
                  ) : null}
                </Inline>
              </Table.Cell>
              <Table.Cell numeric>{row.departs}</Table.Cell>
              <Table.Cell numeric>
                <Amount value={row.fare} currency="GBP" />
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
      <TextField label="Passenger name" placeholder="Ines Varga" />
      <Alert tone="info" title="Kelso Bay pier works">
        Boarding moves to berth 3 until Friday.
      </Alert>
      <Inline gap={3}>
        <Button>Book a seat</Button>
        <Button variant="outline" tone="neutral">
          Save route
        </Button>
      </Inline>
    </Stack>
  )
}

/** One theme in light and dark, side by side, whatever the page is set to. */
export function ThemeSpecimen({ theme }: { theme: ThemeName }) {
  return (
    <div className={styles.pair} data-kiln-component="theme-specimen">
      {(['light', 'dark'] as const).map((mode) => (
        <ThemeScope key={mode} theme={theme} mode={mode} className={styles.sheet}>
          <Stack gap={4}>
            <Text as="p" size="xs" tone="muted">
              {mode === 'light' ? 'Light' : 'Dark'}
            </Text>
            <Screen theme={theme} />
          </Stack>
        </ThemeScope>
      ))}
    </div>
  )
}

/** Every built-in theme at once, in the page's mode. */
export function ThemeCompare() {
  return (
    <div className={styles.grid} data-kiln-component="theme-compare">
      {THEMES.map((theme) => (
        <ThemeScope key={theme} theme={theme} className={styles.sheet}>
          <Screen theme={theme} />
        </ThemeScope>
      ))}
    </div>
  )
}
