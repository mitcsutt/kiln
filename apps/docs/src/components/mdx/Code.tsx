'use client'

import { CodeBlock } from '@mitcsutt/kiln-ui'

const LANGUAGES: Record<string, string> = {
  ts: 'TypeScript',
  tsx: 'TSX',
  js: 'JavaScript',
  jsx: 'JSX',
  json: 'JSON',
  css: 'CSS',
  sh: 'Shell',
  bash: 'Shell',
  md: 'Markdown',
  mdx: 'MDX',
  html: 'HTML',
  yaml: 'YAML',
  txt: 'Text',
}

export function Code({
  code,
  language,
  title,
}: {
  code: string
  language?: string
  title?: string
}) {
  return (
    <CodeBlock
      code={code}
      language={language ? (LANGUAGES[language] ?? language) : undefined}
      title={title}
    />
  )
}
