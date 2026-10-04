'use client'

import { FileField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <FileField
      label="Photo for your pass"
      description="A JPEG or PNG under 5 MB, face straight on"
      accept="image/jpeg,image/png"
      maxSize={5_000_000}
      preview="thumbnails"
    />
  )
}
