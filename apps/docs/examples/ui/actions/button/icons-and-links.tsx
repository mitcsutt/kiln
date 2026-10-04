'use client'

import { ArrowUpRightIcon, Button, Inline, PlusIcon } from '@mitcsutt/kiln-ui'

export default function IconsAndLinks() {
  return (
    <Inline gap={3}>
      <Button leadingIcon={<PlusIcon />}>Add a stop</Button>
      <Button asChild variant="outline" tone="neutral" trailingIcon={<ArrowUpRightIcon />}>
        <a href="https://github.com/mitcsutt/kiln">Source on GitHub</a>
      </Button>
    </Inline>
  )
}
