import { Code, CodeBlock, Grid, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'
import type { ParityFixture } from '#stories/fixtures'

export interface ParityProps {
  /** A shared parity fixture: the same form written in JSX and as a schema. */
  fixture: ParityFixture
  /** The fixture's schema object, printed under the pair so the JSON can be read next to the JSX. */
  schema: unknown
  /** The components the JSX side uses, e.g. `['FormGrid', 'FormGrid.Item']`. */
  components: readonly string[]
}

function ModeColumn({
  title,
  keys,
  children,
}: {
  title: string
  keys: readonly string[]
  children: ReactNode
}) {
  return (
    <Stack gap={4}>
      <Stack gap={2}>
        <Text size="sm" weight="medium">
          {title}
        </Text>
        <Inline gap={2} justify="start">
          {keys.map((key) => (
            <Text key={key} as="span" size="sm">
              <Code>{key}</Code>
            </Text>
          ))}
        </Inline>
      </Stack>
      {children}
    </Stack>
  )
}

/**
 * The §16 "same form twice" layout: one parity fixture rendered in component mode and in schema
 * mode side by side, with the schema printed underneath. The render-equivalence tests assert the
 * two produce the same accessibility tree; this is the same claim, made visible.
 */
export function Parity({ fixture, schema, components }: ParityProps) {
  const { ComponentMode, SchemaMode } = fixture
  const layoutKeys = fixture.covers.map((key) => `"${key}"`)
  return (
    <Stack gap={8}>
      <Grid columns={{ base: 1, lg: 2 }} gap={8}>
        <ModeColumn title="Component mode" keys={components.map((name) => `<${name}>`)}>
          <ComponentMode />
        </ModeColumn>
        <ModeColumn title="Schema mode" keys={layoutKeys}>
          <SchemaMode />
        </ModeColumn>
      </Grid>
      <CodeBlock
        title="Schema"
        language="JSON"
        copyable={false}
        code={JSON.stringify(schema, null, 2)}
      />
    </Stack>
  )
}
