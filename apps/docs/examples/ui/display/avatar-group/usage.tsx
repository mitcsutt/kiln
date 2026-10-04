'use client'

import { Avatar, AvatarGroup, Inline, Text } from '@mitcsutt/kiln-ui'

const CREW = [
  'Ines Varga',
  'Tomasz Okoro',
  'Priya Halvorsen',
  'Joon Park',
  'Amara Lindqvist',
  'Felix Duarte',
]

export default function Usage() {
  return (
    <Inline gap={3}>
      <AvatarGroup max={4} aria-label="Crew on the 07:10 sailing">
        {CREW.map((name) => (
          <Avatar key={name} name={name} />
        ))}
      </AvatarGroup>
      <Text size="sm" tone="muted">
        6 crew on the 07:10 sailing
      </Text>
    </Inline>
  )
}
