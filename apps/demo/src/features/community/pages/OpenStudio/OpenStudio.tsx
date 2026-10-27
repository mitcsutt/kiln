import { Board } from '@mitcsutt/kiln-dnd'
import { Grid, Inline, SectionHeader, Stack, Text } from '@mitcsutt/kiln-ui'

import { PageHeader } from '#components/PageHeader'
import { PROPOSAL_COLUMNS, PROPOSALS } from '#features/community/data/openStudio'

import { DoorAccess } from './components/DoorAccess'
import { PosterDesk } from './components/PosterDesk'
import { ProposalForm } from './components/ProposalForm'
import { VolunteerForm } from './components/VolunteerForm'

/** Planning the open studio night: who runs what, the poster, and the volunteers. */
export function OpenStudio() {
  return (
    <Stack gap={8}>
      <PageHeader
        kicker="Community"
        title="Open studio night"
        description="Saturday 5 December. Drag a session to Confirmed once someone has said yes."
        theme="riso"
      />
      <Stack gap={4}>
        <SectionHeader level={2} size="lg" title="Sessions" />
        <Board
          label="Open studio sessions"
          columns={PROPOSAL_COLUMNS}
          defaultItems={PROPOSALS}
          getLabel={(proposal) => proposal.title}
        >
          {(proposal) => (
            <Inline gap={2} justify="between">
              <Text size="sm">{proposal.title}</Text>
              <Text size="sm" tone="muted">
                {proposal.by}
              </Text>
            </Inline>
          )}
        </Board>
      </Stack>
      <Stack gap={4}>
        <SectionHeader level={2} size="lg" title="Propose a session" />
        <ProposalForm />
      </Stack>
      <Stack gap={4}>
        <SectionHeader level={2} size="lg" title="The poster" />
        <PosterDesk />
      </Stack>
      <Grid columns={{ base: 1, lg: 2 }} gap={6}>
        <Stack gap={4}>
          <SectionHeader level={2} size="lg" title="Volunteer" />
          <VolunteerForm />
        </Stack>
        <DoorAccess />
      </Grid>
    </Stack>
  )
}
