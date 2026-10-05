import { Code, Heading, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={3}>
      <Text>
        Run <Code>pnpm add @mitcsutt/kiln-ui</Code>, then import <Code>styles.css</Code> once.
      </Text>
      <Heading level={3} size="lg">
        The <Code>gap</Code> prop
      </Heading>
    </Stack>
  )
}
