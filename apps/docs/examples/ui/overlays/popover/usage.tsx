'use client'

import { Button, DataList, Popover } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Popover>
      <Popover.Trigger asChild>
        <Button variant="outline" tone="neutral">
          Sailing details
        </Button>
      </Popover.Trigger>
      <Popover.Content aria-label="Sailing details" arrow>
        <DataList>
          <DataList.Item label="Vessel">MV Marram</DataList.Item>
          <DataList.Item label="Berth">3</DataList.Item>
          <DataList.Item label="Crossing">42 minutes</DataList.Item>
        </DataList>
      </Popover.Content>
    </Popover>
  )
}
