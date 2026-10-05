import { FileDrop } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <FileDrop
      aria-label="Proof of concession"
      accept="image/*,application/pdf"
      multiple
      maxFiles={2}
      maxSize={5_000_000}
      preview="thumbnails"
    />
  )
}
