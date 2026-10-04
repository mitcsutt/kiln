import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { expect, screen, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'
import { Button } from '#components/actions/Button'
import { Stack } from '#components/layout/Stack'
import { ArrowUpRightIcon, ChevronDownIcon, CopyIcon, MoreIcon } from '#icons'
import { Spacer } from '#components/overlays/_story/StoryKit'
import { DropdownMenu, type DropdownMenuContentProps } from './DropdownMenu'

const meta = {
  title: 'UI/Overlays/DropdownMenu',
  component: DropdownMenu.Content,
  args: { side: 'bottom', align: 'start' },
  argTypes: {
    side: { control: 'inline-radio', options: ['top', 'right', 'bottom', 'left'] },
    align: { control: 'inline-radio', options: ['start', 'center', 'end'] },
  },
} satisfies Meta<typeof DropdownMenu.Content>

export default meta
type Story = StoryObj<typeof meta>

const PROJECTS = ['Atlas redesign', 'Billing migration', 'Mobile app', 'Help centre']

function MemberActions({ open, ...args }: DropdownMenuContentProps & { open?: boolean }) {
  const [live, setLive] = useState(true)
  const [sort, setSort] = useState('updated')
  return (
    <DropdownMenu open={open} modal={false}>
      <DropdownMenu.Trigger asChild>
        <Button variant="outline" tone="neutral" trailingIcon={<ChevronDownIcon />}>
          Noor
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content {...args}>
        <DropdownMenu.Label>Member</DropdownMenu.Label>
        <DropdownMenu.Item shortcut="⌘E">Rename</DropdownMenu.Item>
        <DropdownMenu.Item shortcut="⌘L">Send sign-in link</DropdownMenu.Item>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Add to project</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            {PROJECTS.map((o) => (
              <DropdownMenu.Item key={o}>{o}</DropdownMenu.Item>
            ))}
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Separator />
        <DropdownMenu.CheckboxItem checked={live} onCheckedChange={setLive}>
          Email notifications
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Label>Sort projects by</DropdownMenu.Label>
        <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenu.RadioItem value="updated">Last updated</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="name">Name</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="client">Client</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
        <DropdownMenu.Separator />
        <DropdownMenu.Item tone="critical">Remove from workspace</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}

export const Playground: Story = {
  render: (args) => <MemberActions {...args} />,
  play: async ({ canvasElement }) => {
    const trigger = within(storyRoot(canvasElement)).getByRole('button', { name: 'Noor' })
    await userEvent.click(trigger)
    const menu = await screen.findByRole('menu')
    await expect(
      within(menu).getByRole('menuitemcheckbox', { name: 'Email notifications' }),
    ).toBeChecked()
    await userEvent.click(
      within(menu).getByRole('menuitemcheckbox', { name: 'Email notifications' }),
    )
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    await userEvent.click(trigger)
    await expect(
      await screen.findByRole('menuitemcheckbox', { name: 'Email notifications' }),
    ).not.toBeChecked()
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())
    await expect(trigger).toHaveFocus()
  },
}

/** A member's actions in a workspace admin screen. Destructive last, after a rule. Pinned open. */
export const MemberActionsOpen: Story = {
  render: (args) => (
    <Stack gap={0} align="start">
      <MemberActions {...args} open />
      <Spacer size="lg" />
    </Stack>
  ),
}

/** Row actions on an invoice. Icons on every item or none — never a mix. */
export const RowActions: Story = {
  args: { align: 'end' },
  render: (args) => (
    <Stack gap={0} align="end">
      <DropdownMenu open modal={false}>
        <DropdownMenu.Trigger asChild>
          <Button variant="ghost" tone="neutral" aria-label="Actions for INV-1042, $1,820.00">
            <MoreIcon />
          </Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content {...args}>
          <DropdownMenu.Item leadingIcon={<CopyIcon />} shortcut="⌘D">
            Duplicate
          </DropdownMenu.Item>
          <DropdownMenu.Item leadingIcon={<ArrowUpRightIcon />}>Open PDF</DropdownMenu.Item>
          <DropdownMenu.Item disabled leadingIcon={<ArrowUpRightIcon />}>
            Open payment record
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu>
      <Spacer size="lg" />
    </Stack>
  ),
}
