'use client'

import { TagsField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <TagsField
      label="Labels"
      description="Press Enter or a comma to add one"
      defaultValue={['commute']}
      maxTags={5}
      normalise="lowercase"
    />
  )
}
