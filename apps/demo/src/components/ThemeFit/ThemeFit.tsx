import { Box, Button, Inline, Stack, Swatch, Text, ThemeScope } from '@mitcsutt/kiln-ui'

import { DEMO_THEMES, type DemoTheme } from '#constants/demoThemes'
import { useThemePreference } from '#stores/themePreference'

/**
 * Which theme a page was designed around, previewed in that theme with `ThemeScope`, and a button
 * that switches the whole app to it. Every page works in every theme; this says where it fits best.
 */
export function ThemeFit({ theme }: { theme: DemoTheme }) {
  const current = useThemePreference()
  const info = DEMO_THEMES[theme]
  return (
    <ThemeScope theme={theme} mode={current.resolvedMode}>
      <Box padding={3} border radius="surface">
        <Inline gap={3} align="center" justify="between">
          <Inline gap={2} align="center">
            <Swatch color="accent" size="sm" />
            <Stack gap={0}>
              <Text size="sm" weight="strong">
                Made for {info.label}
              </Text>
              <Text size="xs" tone="muted">
                {info.goal}
              </Text>
            </Stack>
          </Inline>
          {current.theme === theme ? (
            <Text size="xs" tone="muted">
              In use
            </Text>
          ) : (
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                current.setTheme(theme)
              }}
            >
              Switch to {info.label}
            </Button>
          )}
        </Inline>
      </Box>
    </ThemeScope>
  )
}
