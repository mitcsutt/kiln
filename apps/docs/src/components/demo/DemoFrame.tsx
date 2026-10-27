'use client'

import { Button, Heading, Inline, Stack, Text, useTheme } from '@mitcsutt/kiln-ui'
import styles from './DemoFrame.module.css'

const DEMO_THEMES = ['paper', 'ledger', 'flightdeck', 'riso']

/**
 * The demo app in a frame. It opens in the site's theme when the demo has that theme, and keeps
 * its own switcher inside, so a reader can move between the four from either side.
 */
export function DemoFrame() {
  const { theme } = useTheme()
  const start = DEMO_THEMES.includes(theme) ? theme : 'paper'
  const src = `/demo-app/index.html?theme=${start}`
  return (
    <Stack gap={5}>
      <Stack gap={3}>
        <Heading level={1} size="3xl">
          Slipcast, the demo app
        </Heading>
        <Text tone="muted" measure="text">
          A pottery co-op built with every component, field, layout and hook Kiln ships. Each area
          is designed for one of the four themes: studio admin for Paper, the books for Ledger, the
          kiln room for Flightdeck and the community pages for Riso. All its data is invented, and
          nothing leaves your browser.
        </Text>
        <Inline gap={3}>
          <Button asChild variant="outline" tone="neutral" size="sm">
            <a href={src} target="_blank" rel="noreferrer">
              Open it full screen
            </a>
          </Button>
        </Inline>
      </Stack>
      <iframe key={start} src={src} title="Slipcast, the Kiln demo app" className={styles.frame} />
    </Stack>
  )
}
