'use client'

import { DataList } from '@mitcsutt/kiln-ui'

export default function Vertical() {
  return (
    <DataList orientation="vertical">
      <DataList.Item label="Pass">Annual, all zones</DataList.Item>
      <DataList.Item label="Valid until">31 October 2027</DataList.Item>
      <DataList.Item label="Holder">Ines Varga</DataList.Item>
    </DataList>
  )
}
