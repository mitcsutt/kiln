'use client'

import {
  CopyIcon,
  IconButton,
  Inline,
  SearchIcon,
  StarIcon,
  Tooltip,
  TooltipProvider,
} from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <TooltipProvider>
      <Inline gap={2}>
        <Tooltip content="Search stops">
          <IconButton label="Search stops" icon={<SearchIcon />} />
        </Tooltip>
        <Tooltip content="Copy share link">
          <IconButton label="Copy share link" icon={<CopyIcon />} />
        </Tooltip>
        <Tooltip content="Save route" side="bottom">
          <IconButton label="Save route" icon={<StarIcon />} />
        </Tooltip>
      </Inline>
    </TooltipProvider>
  )
}
