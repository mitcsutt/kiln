'use client'

import { avatarColor, getInitials, Stack, Text } from '@mitcsutt/kiln-ui'

export default function Helpers() {
  return (
    <Stack gap={2}>
      <Text>getInitials(&apos;Priya Halvorsen&apos;) is {getInitials('Priya Halvorsen')}</Text>
      <Text>avatarColor(&apos;Priya Halvorsen&apos;) is {avatarColor('Priya Halvorsen')}</Text>
    </Stack>
  )
}
