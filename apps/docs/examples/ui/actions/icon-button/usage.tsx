'use client'

import { CopyIcon, IconButton, Inline, MoreIcon, PlusIcon, SearchIcon } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Inline gap={2}>
      <IconButton label="Search stops" icon={<SearchIcon />} />
      <IconButton label="Copy share link" icon={<CopyIcon />} />
      <IconButton label="More route actions" icon={<MoreIcon />} />
      <IconButton label="Add a stop" icon={<PlusIcon />} variant="solid" tone="accent" />
    </Inline>
  )
}
