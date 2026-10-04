'use client'

import { RangeSlider } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <RangeSlider
      aria-label="Departure window"
      defaultValue={[7, 10]}
      min={5}
      max={23}
      minStepsBetweenThumbs={1}
      thumbLabels={['Earliest departure', 'Latest departure']}
      showValue
      formatOptions={{ style: 'unit', unit: 'hour' }}
    />
  )
}
