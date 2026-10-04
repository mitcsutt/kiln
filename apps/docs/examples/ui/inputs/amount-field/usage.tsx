'use client'

import { AmountField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <AmountField
      label="Top-up"
      description="Between £5 and £200"
      currency="GBP"
      locale="en-GB"
      defaultValue={20}
      min={5}
      max={200}
    />
  )
}
