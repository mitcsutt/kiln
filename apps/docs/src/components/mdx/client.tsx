'use client'

import { Alert, CodeBlock, Stack, Text } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'
import { inlineCode } from '@/lib/inlineCode'

/** A note set apart from the text. `tone` is for meaning, not decoration (DESIGN §2). */
export function Callout({
  tone = 'neutral',
  title,
  children,
}: {
  tone?: 'neutral' | 'info' | 'caution' | 'critical' | 'positive'
  title?: string
  children: ReactNode
}) {
  return (
    <Alert tone={tone} title={title}>
      {children}
    </Alert>
  )
}

export function Signature({ code, description }: { code: string; description: string }) {
  return (
    <Stack gap={3} data-kiln-component="signature">
      <CodeBlock code={code} language="TypeScript" />
      {description ? <Text as="p">{inlineCode(description)}</Text> : null}
    </Stack>
  )
}
