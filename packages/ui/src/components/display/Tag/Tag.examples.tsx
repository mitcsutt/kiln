import { Stack, Tag, TagList } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [stops, setStops] = useState(['Harbour Square', 'Kelso Bay', 'Old Quay'])
  return (
    <Stack gap={4}>
      <TagList aria-label="Facilities">
        <Tag>Step-free</Tag>
        <Tag>Bike racks</Tag>
        <Tag>Toilets</Tag>
        <Tag>Café</Tag>
      </TagList>
      <TagList aria-label="Lines">
        <Tag color={1}>Coastal</Tag>
        <Tag color={2}>Harbour</Tag>
        <Tag color={3}>Market</Tag>
        <Tag color={4}>Night</Tag>
      </TagList>
      <TagList aria-label="Saved stops">
        {stops.map((stop) => (
          <Tag
            key={stop}
            onRemove={() => {
              setStops((current) => current.filter((item) => item !== stop))
            }}
          >
            {stop}
          </Tag>
        ))}
      </TagList>
    </Stack>
  )
}
