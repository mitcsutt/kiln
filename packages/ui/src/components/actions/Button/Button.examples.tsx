import { ArrowUpRightIcon, Button, Inline, PlusIcon, Stack } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Hierarchy() {
  return (
    <Inline gap={3}>
      <Button>Publish timetable</Button>
      <Button variant="outline" tone="neutral">
        Export CSV
      </Button>
      <Button variant="ghost" tone="neutral">
        Cancel
      </Button>
    </Inline>
  )
}

export function Tones() {
  return (
    <Stack gap={4}>
      {(['accent', 'neutral', 'critical'] as const).map((tone) => (
        <Inline key={tone} gap={3}>
          <Button tone={tone}>Solid</Button>
          <Button tone={tone} variant="outline">
            Outline
          </Button>
          <Button tone={tone} variant="ghost">
            Ghost
          </Button>
        </Inline>
      ))}
    </Stack>
  )
}

export function Sizes() {
  return (
    <Inline gap={3}>
      <Button size="sm">Book a seat</Button>
      <Button size="md">Book a seat</Button>
      <Button size="lg">Book a seat</Button>
    </Inline>
  )
}

export function IconsAndLinks() {
  return (
    <Inline gap={3}>
      <Button leadingIcon={<PlusIcon />}>Add a stop</Button>
      <Button asChild variant="outline" tone="neutral" trailingIcon={<ArrowUpRightIcon />}>
        <a href="https://github.com/mitcsutt/kiln">Source on GitHub</a>
      </Button>
    </Inline>
  )
}

export function States() {
  const [saving, setSaving] = useState(false)
  return (
    <Inline gap={3}>
      <Button
        loading={saving}
        onClick={() => {
          setSaving(true)
          setTimeout(() => {
            setSaving(false)
          }, 1500)
        }}
      >
        Save route
      </Button>
      <Button disabled>Sold out</Button>
    </Inline>
  )
}
