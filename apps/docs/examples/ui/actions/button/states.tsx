'use client'

import { Button, Inline } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export default function States() {
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
