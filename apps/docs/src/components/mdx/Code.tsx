'use client'

import { CodeBlock, type CodeToken } from '@mitcsutt/kiln-ui'

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
  tokens,
}: {
  code: string
  language?: string
  title?: string
  tokens?: CodeToken[][]
}) {
  return (
    <CodeBlock
      code={code}
      language={language ? (LANGUAGES[language] ?? language) : undefined}
      title={title}
      tokens={tokens}
    />
  )
}
