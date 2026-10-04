'use client'

import { CodeBlock, Stack } from '@mitcsutt/kiln-ui'

const SOURCE = `import '@mitcsutt/kiln-ui/styles.css'
import { ThemeProvider } from '@mitcsutt/kiln-ui'

export function App({ children }) {
  return <ThemeProvider theme="paper">{children}</ThemeProvider>
}`

export default function Usage() {
  return (
    <Stack gap={4}>
      <CodeBlock
        title="src/App.tsx"
        language="TSX"
        code={SOURCE}
        highlightLines={[5]}
        showLineNumbers
      />
      <CodeBlock language="Shell" code="pnpm add @mitcsutt/kiln-ui" />
    </Stack>
  )
}
