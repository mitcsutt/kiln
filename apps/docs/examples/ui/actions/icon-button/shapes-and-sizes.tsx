'use client'

import { CloseIcon, IconButton, Inline, MenuIcon, Stack } from '@mitcsutt/kiln-ui'

export default function ShapesAndSizes() {
  return (
    <Stack gap={4}>
      <Inline gap={3}>
        <IconButton size="sm" variant="outline" label="Close" icon={<CloseIcon />} />
        <IconButton size="md" variant="outline" label="Close" icon={<CloseIcon />} />
        <IconButton size="lg" variant="outline" label="Close" icon={<CloseIcon />} />
      </Inline>
      <Inline gap={3}>
        <IconButton variant="outline" shape="auto" label="Open menu" icon={<MenuIcon />} />
        <IconButton variant="outline" shape="round" label="Open menu" icon={<MenuIcon />} />
        <IconButton variant="outline" shape="square" label="Open menu" icon={<MenuIcon />} />
      </Inline>
    </Stack>
  )
}
