import { Avatar, avatarColor, getInitials, Inline, Stack, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Inline gap={4}>
      <Avatar name="Ines Varga" size="xl" src="/images/portrait.svg" alt="Ines Varga" />
      <Avatar name="Ines Varga" size="lg" />
      <Avatar name="Tomasz Okoro" />
      <Avatar name="Priya Halvorsen" size="sm" ring />
      <Avatar name="Bayline Ferries" initials="BF" size="xs" />
    </Inline>
  )
}

export function Helpers() {
  return (
    <Stack gap={2}>
      <Text>getInitials(&apos;Priya Halvorsen&apos;) is {getInitials('Priya Halvorsen')}</Text>
      <Text>avatarColor(&apos;Priya Halvorsen&apos;) is {avatarColor('Priya Halvorsen')}</Text>
    </Stack>
  )
}
