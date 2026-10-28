import {
  ActionBar,
  Avatar,
  Badge,
  Button,
  Card,
  Checkbox,
  DropdownMenu,
  EmptyState,
  Grid,
  IconButton,
  Inline,
  Input,
  MoreIcon,
  RelativeTime,
  SearchIcon,
  SegmentedControl,
  Select,
  Page,
  Stack,
  Table,
  Tag,
  TagList,
  Text,
  ToggleChip,
  toast,
  type TableSort,
} from '@mitcsutt/kiln-ui'
import { useMemo, useState } from 'react'

import { PageHeader } from '#components/PageHeader'
import { PLAN_LABELS, ROLE_LABELS, type Member } from '#features/studio/data/members'

import { InviteDialog } from './components/InviteDialog'
import { MemberSheet } from './components/MemberSheet'

type SortKey = 'name' | 'joined' | 'firings'

function compare(a: Member, b: Member, key: SortKey) {
  if (key === 'firings') return a.firingsThisMonth - b.firingsThisMonth
  if (key === 'joined') return a.joined.localeCompare(b.joined)
  return a.name.localeCompare(b.name)
}

/** The co-op's members: search, filter, sort, select in bulk, and open one for detail. */
export function Members({ members }: { members: Member[] }) {
  const [query, setQuery] = useState('')
  const [role, setRole] = useState<string>('all')
  const [keyholders, setKeyholders] = useState(false)
  const [view, setView] = useState('table')
  const [sort, setSort] = useState<{ key: SortKey; direction: 'asc' | 'desc' }>({
    key: 'name',
    direction: 'asc',
  })
  const [selected, setSelected] = useState<string[]>([])
  const [open, setOpen] = useState<Member | null>(null)

  const shown = useMemo(() => {
    const q = query.trim().toLowerCase()
    return members
      .filter((member) => (q ? member.name.toLowerCase().includes(q) : true))
      .filter((member) => (role === 'all' ? true : member.role === role))
      .filter((member) => (keyholders ? member.keyholder : true))
      .sort((a, b) => compare(a, b, sort.key) * (sort.direction === 'asc' ? 1 : -1))
  }, [members, query, role, keyholders, sort])

  const sortOf = (key: SortKey): TableSort => (sort.key === key ? sort.direction : 'none')
  const sortBy = (key: SortKey) => () => {
    setSort((current) => ({
      key,
      direction: current.key === key && current.direction === 'asc' ? 'desc' : 'asc',
    }))
  }
  const allSelected = shown.length > 0 && shown.every((member) => selected.includes(member.id))

  return (
    <Page>
      <PageHeader
        kicker="Studio admin"
        title="Members"
        description={`${String(members.length)} people share the studio. Keyholders can open up and run a firing alone.`}
        theme="paper"
        actions={<InviteDialog />}
      />
      <Inline gap={3} align="center" justify="between">
        <Inline gap={3} align="center">
          <Input
            aria-label="Search members"
            placeholder="Search by name"
            leading={<SearchIcon />}
            value={query}
            onChange={(event) => {
              setQuery(event.target.value)
            }}
          />
          <Select
            aria-label="Role"
            value={role}
            onValueChange={setRole}
            options={[
              { value: 'all', label: 'Every role' },
              ...Object.entries(ROLE_LABELS).map(([value, label]) => ({ value, label })),
            ]}
          />
          <ToggleChip
            pressed={keyholders}
            onPressedChange={setKeyholders}
            count={members.filter((member) => member.keyholder).length}
          >
            Keyholders
          </ToggleChip>
        </Inline>
        <SegmentedControl aria-label="Layout" value={view} onValueChange={setView}>
          <SegmentedControl.Item value="table">Table</SegmentedControl.Item>
          <SegmentedControl.Item value="cards">Cards</SegmentedControl.Item>
        </SegmentedControl>
      </Inline>

      {selected.length > 0 ? (
        <ActionBar align="between">
          <Text size="sm">{selected.length} selected</Text>
          <Inline gap={2}>
            <Button
              size="sm"
              variant="ghost"
              tone="neutral"
              onClick={() => {
                setSelected([])
              }}
            >
              Clear
            </Button>
            <Button
              size="sm"
              onClick={() => {
                toast({
                  title: 'Reminder sent',
                  description: `${String(selected.length)} members will get this month's rota.`,
                  tone: 'positive',
                })
                setSelected([])
              }}
            >
              Email the rota
            </Button>
          </Inline>
        </ActionBar>
      ) : null}

      {shown.length === 0 ? (
        <EmptyState
          framed
          align="center"
          title="No members match"
          description="Try another name, or show every role."
          action={
            <Button
              variant="outline"
              tone="neutral"
              onClick={() => {
                setQuery('')
                setRole('all')
                setKeyholders(false)
              }}
            >
              Clear filters
            </Button>
          }
        />
      ) : view === 'table' ? (
        <Table label="Members" density="compact" surface="surface">
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell width="min">
                <Checkbox
                  aria-label="Select every member shown"
                  checked={allSelected}
                  onCheckedChange={(checked) => {
                    setSelected(checked === true ? shown.map((member) => member.id) : [])
                  }}
                />
              </Table.HeaderCell>
              <Table.HeaderCell sort={sortOf('name')} onSort={sortBy('name')}>
                Member
              </Table.HeaderCell>
              <Table.HeaderCell hideBelow="md">Role</Table.HeaderCell>
              <Table.HeaderCell hideBelow="md">Skills</Table.HeaderCell>
              <Table.HeaderCell numeric sort={sortOf('firings')} onSort={sortBy('firings')}>
                Firings
              </Table.HeaderCell>
              <Table.HeaderCell hideBelow="sm" sort={sortOf('joined')} onSort={sortBy('joined')}>
                Last in
              </Table.HeaderCell>
              <Table.HeaderCell width="min">
                <Text as="span" size="xs" tone="muted">
                  Actions
                </Text>
              </Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {shown.map((member) => (
              <Table.Row key={member.id} highlighted={selected.includes(member.id)}>
                <Table.Cell>
                  <Checkbox
                    aria-label={`Select ${member.name}`}
                    checked={selected.includes(member.id)}
                    onCheckedChange={(checked) => {
                      setSelected((current) =>
                        checked === true
                          ? [...current, member.id]
                          : current.filter((id) => id !== member.id),
                      )
                    }}
                  />
                </Table.Cell>
                <Table.Cell rowHeader>
                  <Inline gap={2} align="center" wrap={false}>
                    <Avatar name={member.name} size="sm" />
                    <Stack gap={0}>
                      <Text size="sm" weight="medium">
                        {member.name}
                      </Text>
                      <Text size="xs" tone="muted">
                        {PLAN_LABELS[member.plan]}
                        {member.keyholder ? ' · keyholder' : ''}
                      </Text>
                    </Stack>
                  </Inline>
                </Table.Cell>
                <Table.Cell hideBelow="md">
                  <Badge variant="outline">{ROLE_LABELS[member.role]}</Badge>
                </Table.Cell>
                <Table.Cell hideBelow="md">
                  <TagList>
                    {member.skills.map((skill) => (
                      <Tag key={skill} size="sm">
                        {skill}
                      </Tag>
                    ))}
                  </TagList>
                </Table.Cell>
                <Table.Cell numeric>{member.firingsThisMonth}</Table.Cell>
                <Table.Cell hideBelow="sm">
                  <RelativeTime date={member.lastVisit} />
                </Table.Cell>
                <Table.Cell>
                  <MemberActions
                    member={member}
                    onOpen={() => {
                      setOpen(member)
                    }}
                  />
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : (
        <Grid minItemWidth="sm" gap={4}>
          {shown.map((member) => (
            <Card key={member.id} variant="outline">
              <Card.Header leading={<Avatar name={member.name} />}>
                <Card.Title>{member.name}</Card.Title>
                <Card.Meta>{ROLE_LABELS[member.role]}</Card.Meta>
              </Card.Header>
              <Card.Body>
                <Text size="sm" tone="muted">
                  {member.firingsThisMonth} firings this month · {PLAN_LABELS[member.plan]} plan
                </Text>
              </Card.Body>
              <Card.Footer>
                <Button
                  size="sm"
                  variant="outline"
                  tone="neutral"
                  onClick={() => {
                    setOpen(member)
                  }}
                >
                  View {member.name.split(' ')[0]}
                </Button>
              </Card.Footer>
            </Card>
          ))}
        </Grid>
      )}
      <MemberSheet
        member={open}
        onOpenChange={(next) => {
          if (!next) setOpen(null)
        }}
      />
    </Page>
  )
}

function MemberActions({ member, onOpen }: { member: Member; onOpen: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenu.Trigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          label={`Actions for ${member.name}`}
          icon={<MoreIcon />}
        />
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item onSelect={onOpen}>View details</DropdownMenu.Item>
        <DropdownMenu.Item
          onSelect={() => {
            toast(`Key fob reissued for ${member.name}`)
          }}
        >
          Reissue key fob
        </DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item
          tone="critical"
          onSelect={() => {
            toast({ title: `${member.name} paused`, tone: 'caution' })
          }}
        >
          Pause membership
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu>
  )
}
