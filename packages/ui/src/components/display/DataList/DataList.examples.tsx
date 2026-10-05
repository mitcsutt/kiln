import { Badge, DataList } from '@mitcsutt/kiln-ui'

export function Usage() {
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

export function Vertical() {
  return (
    <DataList orientation="vertical">
      <DataList.Item label="Pass">Annual, all zones</DataList.Item>
      <DataList.Item label="Valid until">31 October 2027</DataList.Item>
      <DataList.Item label="Holder">Ines Varga</DataList.Item>
    </DataList>
  )
}
