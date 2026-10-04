'use client'

import { TextareaField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <TextareaField
      label="What went wrong?"
      description="Tell us the date, the route and what happened."
      autoResize
      maxRows={8}
      maxLength={600}
      showCount
    />
  )
}
