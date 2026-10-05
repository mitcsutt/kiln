import { Slider, Stack } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={6}>
      <Slider
        aria-label="Walking distance"
        defaultValue={800}
        min={0}
        max={2000}
        step={100}
        showValue
        formatOptions={{ style: 'unit', unit: 'meter' }}
      />
      <Slider
        aria-label="Seats"
        defaultValue={2}
        min={1}
        max={6}
        marks={[1, 2, 3, 4, 5, 6].map((value) => ({ value, label: String(value) }))}
        size="sm"
      />
    </Stack>
  )
}
