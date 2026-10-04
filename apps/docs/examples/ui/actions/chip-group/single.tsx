'use client'

import { ChipGroup } from '@mitcsutt/kiln-ui'

const ZONES = ['1', '2', '3', '4', '5'].map((zone) => ({ value: zone, label: `Zone ${zone}` }))

export default function Single() {
  return <ChipGroup type="single" aria-label="Fare zone" options={ZONES} defaultValue="2" />
}
