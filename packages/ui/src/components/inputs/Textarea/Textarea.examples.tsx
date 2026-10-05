import { Textarea } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Textarea
      aria-label="Message to the crew"
      placeholder="Anything the crew should know, like a wheelchair space or a large bag"
      autoResize
      rows={2}
      maxRows={6}
    />
  )
}
