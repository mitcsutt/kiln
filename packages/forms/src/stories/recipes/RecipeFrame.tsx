import { CodeBlock, Container, Section, ThemeScope, type ThemeName } from '@mitcsutt/kiln-ui'
import type { ReactNode } from 'react'

/**
 * A recipe renders in a fixed theme regardless of the toolbar's theme (the toolbar's mode still
 * applies, so every recipe can be checked light and dark). A `ThemeScope` rather than story-level
 * `globals`, which would lock the toolbar.
 */
export function RecipeFrame({
  theme,
  width = 'content',
  children,
}: {
  theme: ThemeName
  width?: 'narrow' | 'text' | 'content' | 'wide'
  children: ReactNode
}) {
  return (
    <ThemeScope theme={theme}>
      <Section as="div" space={{ base: 6, md: 8 }}>
        <Container width={width}>{children}</Container>
      </Section>
    </ThemeScope>
  )
}

/** What the form handed to `onSubmit` — shown under a recipe so the library's output is inspectable. */
export function SubmittedOutput({
  title = 'Submitted output',
  value,
}: {
  title?: string
  value: unknown
}) {
  return (
    <CodeBlock
      title={title}
      language="JSON"
      copyable={false}
      code={JSON.stringify(value, null, 2)}
    />
  )
}
