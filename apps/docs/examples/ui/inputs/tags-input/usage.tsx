'use client'

import { TagsInput } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <TagsInput
      aria-label="Route labels"
      defaultValue={['commute', 'weekend']}
      maxTags={5}
      normalise="lowercase"
      placeholder="Add a label"
    />
  )
}
