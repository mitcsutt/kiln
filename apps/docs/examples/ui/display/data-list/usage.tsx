'use client'

import { Badge, DataList } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <DataList divided>
      <DataList.Item label="Departs">Harbour Square, berth 3</DataList.Item>
      <DataList.Item label="Arrives">Kelso Bay Pier, 07:52</DataList.Item>
      <DataList.Item label="Vessel">MV Marram</DataList.Item>
      <DataList.Item label="Status">
        <Badge tone="positive">On time</Badge>
      </DataList.Item>
    </DataList>
  )
}
