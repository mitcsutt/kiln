'use client'

import { SegmentedControl } from '@mitcsutt/kiln-ui'

export default function Responsive() {
  return (
    <SegmentedControl
      aria-label="Departures"
      size={{ base: 'lg', md: 'md' }}
      fullWidth={{ base: true, md: false }}
      defaultValue="today"
      options={[
        { value: 'today', label: 'Today' },
        { value: 'tomorrow', label: 'Tomorrow' },
        { value: 'weekend', label: 'Weekend' },
      ]}
    />
  )
}
