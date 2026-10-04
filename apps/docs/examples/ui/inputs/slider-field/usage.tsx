'use client'

import { SliderField } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <SliderField
      label="Maximum walk to a stop"
      description="We'll only suggest routes within this distance"
      defaultValue={800}
      min={200}
      max={2000}
      step={100}
      showValue
      formatOptions={{ style: 'unit', unit: 'meter' }}
    />
  )
}
