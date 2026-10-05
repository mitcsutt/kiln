import { ColorInput, Stack } from '@mitcsutt/kiln-ui'

const LINE_COLOURS = [
  { value: '#1f6f8b', label: 'Harbour blue' },
  { value: '#2e8b57', label: 'Coastal green' },
  { value: '#c4553d', label: 'Signal red' },
  { value: '#d9a21b', label: 'Market gold' },
]

export function Usage() {
  return (
    <Stack gap={4}>
      <ColorInput aria-label="Line colour" defaultValue="#1f6f8b" swatches={LINE_COLOURS} />
      <ColorInput
        aria-label="Line colour"
        defaultValue="#2e8b57"
        swatches={LINE_COLOURS}
        swatchesOnly
      />
    </Stack>
  )
}
