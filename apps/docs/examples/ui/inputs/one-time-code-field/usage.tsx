'use client'

import { OneTimeCodeField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <OneTimeCodeField
      label="Verification code"
      description="We sent six digits to the number ending 4417"
      length={6}
    />
  )
}
