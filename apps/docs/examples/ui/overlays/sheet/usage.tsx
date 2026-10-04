'use client'

import { Amount, Button, DataList, Sheet, Stack } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Sheet>
      <Sheet.Trigger asChild>
        <Button variant="outline" tone="neutral">
          Your basket
        </Button>
      </Sheet.Trigger>
      <Sheet.Content
        side={{ base: 'bottom', md: 'right' }}
        title="Your basket"
        description="Two items"
      >
        <Stack gap={5}>
          <DataList>
            <DataList.Item label="Annual pass">
              <Amount value={96} currency="GBP" locale="en-GB" />
            </DataList.Item>
            <DataList.Item label="Helmet, medium">
              <Amount value={24.5} currency="GBP" locale="en-GB" />
            </DataList.Item>
          </DataList>
          <Sheet.Footer>
            <Button fullWidth>Check out</Button>
          </Sheet.Footer>
        </Stack>
      </Sheet.Content>
    </Sheet>
  )
}
