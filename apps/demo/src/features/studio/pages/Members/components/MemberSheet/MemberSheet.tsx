import {
  Badge,
  Button,
  CopyButton,
  DataList,
  Inline,
  Meter,
  Sheet,
  Stack,
  Tabs,
  Text,
  Code,
} from '@mitcsutt/kiln-ui'

import { PLAN_LABELS, ROLE_LABELS, type Member } from '#features/studio/data/members'

const SHELF_LIMIT = 12

/** One member's detail, in a sheet beside the list. */
export function MemberSheet({
  member,
  onOpenChange,
}: {
  member: Member | null
  onOpenChange: (open: boolean) => void
}) {
  return (
    <Sheet open={member !== null} onOpenChange={onOpenChange}>
      {member ? (
        <Sheet.Content
          side={{ base: 'bottom', md: 'right' }}
          title={member.name}
          description={`${ROLE_LABELS[member.role]}, member since ${member.joined.slice(0, 4)}`}
        >
          <Tabs defaultValue="details">
            <Tabs.List aria-label="Member">
              <Tabs.Trigger value="details">Details</Tabs.Trigger>
              <Tabs.Trigger value="usage">Kiln use</Tabs.Trigger>
            </Tabs.List>
            <Tabs.Content value="details">
              <DataList divided>
                <DataList.Item label="Email">
                  <Inline gap={2} align="center">
                    <Code>{member.email}</Code>
                    <CopyButton value={member.email} label="Copy email" size="sm" />
                  </Inline>
                </DataList.Item>
                <DataList.Item label="Plan">{PLAN_LABELS[member.plan]}</DataList.Item>
                <DataList.Item label="Shelf">{member.shelf ?? 'None yet'}</DataList.Item>
                <DataList.Item label="Keyholder">
                  <Badge tone={member.keyholder ? 'positive' : 'neutral'}>
                    {member.keyholder ? 'Yes' : 'No'}
                  </Badge>
                </DataList.Item>
              </DataList>
            </Tabs.Content>
            <Tabs.Content value="usage">
              <Stack gap={4}>
                <Meter
                  label="Firings this month"
                  value={member.firingsThisMonth}
                  max={SHELF_LIMIT}
                  high={10}
                  optimum={0}
                  valueLabel={`${String(member.firingsThisMonth)} of ${String(SHELF_LIMIT)}`}
                />
                <Text size="sm" tone="muted">
                  Members on the studio plan get twelve kiln slots a month.
                </Text>
              </Stack>
            </Tabs.Content>
          </Tabs>
          <Sheet.Footer>
            <Sheet.Close asChild>
              <Button variant="outline" tone="neutral" fullWidth>
                Done
              </Button>
            </Sheet.Close>
          </Sheet.Footer>
        </Sheet.Content>
      ) : null}
    </Sheet>
  )
}
