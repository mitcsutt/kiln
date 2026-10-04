'use client'

import { RangeSliderField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <RangeSliderField
      label="Fare range"
      thumbLabels={['Lowest fare', 'Highest fare']}
      defaultValue={[2, 8]}
      min={0}
      max={12}
      step={0.5}
      showValue
      formatOptions={{ style: 'currency', currency: 'GBP' }}
    />
  )
}
