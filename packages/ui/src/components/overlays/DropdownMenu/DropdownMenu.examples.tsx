import { CopyIcon, DropdownMenu, IconButton, MoreIcon } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

export function Usage() {
  const [sort, setSort] = useState('time')
  const [notify, setNotify] = useState(true)
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton variant="outline" label="Route options" icon={<MoreIcon />} />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item shortcut="⌘R">Rename</DropdownMenu.Item>
        <DropdownMenu.Item leadingIcon={<CopyIcon />}>Copy share link</DropdownMenu.Item>
        <DropdownMenu.CheckboxItem checked={notify} onCheckedChange={setNotify}>
          Notify me about delays
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Sort departures</DropdownMenu.Label>
        <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenu.RadioItem value="time">By time</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="platform">By berth</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
        <DropdownMenu.Separator />
        <DropdownMenu.Item tone="critical">Delete route</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
