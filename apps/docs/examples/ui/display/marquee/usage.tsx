'use client'

import { Marquee } from '@mitcsutt/kiln-ui'

const UPDATES = [
  '07:10 Kelso Bay: on time',
  '07:25 Old Quay: boarding at berth 2',
  '07:30 Marram Point: 4 min late',
  '07:40 Northpoint: on time',
  '07:55 Harbour loop: on time',
]

export default function Usage() {
  return <Marquee label="Departures" items={UPDATES} speed="slow" separator="·" />
}
