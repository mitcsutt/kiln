'use client'

import { Avatar, Inline } from '@mitcsutt/kiln-ui'

export default function Usage() {
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
