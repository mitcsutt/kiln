import {
  FieldScope,
  FieldViewListBoundary,
  useFieldScope,
  useScopeErrors,
} from '@mitcsutt/kiln-forms'
import { Badge, Box, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

function ErrorCount() {
  const scope = useFieldScope()
  const errors = useScopeErrors(scope)
  return errors > 0 ? (
    <Badge tone="critical">{errors === 1 ? '1 problem' : `${String(errors)} problems`}</Badge>
  ) : null
}

/** A layout of the studio's own: a framed group of fields that counts the errors inside it. */
export function SettingsGroup({
  title,
  description,
  children,
}: {
  title: string
  description?: string
  children: ReactNode
}) {
  return (
    <FieldScope>
      <Box padding={5} border radius="surface">
        <Stack gap={4}>
          <Inline justify="between" align="start">
            <Stack gap={1}>
              <Text weight="strong">{title}</Text>
              {description ? (
                <Text size="sm" tone="muted">
                  {description}
                </Text>
              ) : null}
            </Stack>
            <ErrorCount />
          </Inline>
          <FieldViewListBoundary>
            <Stack gap={4}>{children}</Stack>
          </FieldViewListBoundary>
        </Stack>
      </Box>
    </FieldScope>
  )
}
