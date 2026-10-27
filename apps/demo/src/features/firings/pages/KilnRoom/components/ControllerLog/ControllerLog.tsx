import { DragHandle } from '@mitcsutt/kiln-dnd'
import { Card, CodeBlock, Inline, Stack, Text, type CodeToken } from '@mitcsutt/kiln-ui'
import { highlight } from '@mitcsutt/kiln-ui/highlight'
import { useEffect, useState } from 'react'

/** The controller's last status frame, highlighted once the grammar loads. */
export function ControllerLog({ log }: { log: string }) {
  const [tokens, setTokens] = useState<CodeToken[][] | undefined>()
  useEffect(() => {
    let live = true
    void highlight(log, 'json').then((next) => {
      if (live) setTokens(next)
    })
    return () => {
      live = false
    }
  }, [log])
  return (
    <Card variant="outline" padding={4}>
      <Stack gap={3}>
        <Inline gap={2} align="center" justify="between">
          <Text weight="strong">Controller frame</Text>
          <DragHandle />
        </Inline>
        <CodeBlock
          title="kiln-2/status.json"
          language="JSON"
          code={log}
          tokens={tokens}
          highlightLines={[7]}
          showLineNumbers
        />
      </Stack>
    </Card>
  )
}
