import { Board } from '@mitcsutt/kiln-dnd'
import { Grid, Inline, Page, Text } from '@mitcsutt/kiln-ui'

import { PageHeader } from '#components/PageHeader'
import { PROPOSAL_COLUMNS, PROPOSALS } from '#features/community/data/openStudio'

import { DoorAccess } from './components/DoorAccess'
import { PosterDesk } from './components/PosterDesk'
import { ProposalForm } from './components/ProposalForm'
import { VolunteerForm } from './components/VolunteerForm'

/** Planning the open studio night: who runs what, the poster, and the volunteers. */
export function OpenStudio() {
  return (
    <Page>
      <PageHeader
        kicker="Community"
        title="Open studio night"
        description="Saturday 5 December. Drag a session to Confirmed once someone has said yes."
        theme="riso"
      />
      <Page.Section title="Sessions">
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
      </Page.Section>
      <Page.Section title="Propose a session">
        <ProposalForm />
      </Page.Section>
      <Page.Section title="The poster">
        <PosterDesk />
      </Page.Section>
      <Grid columns={{ base: 1, lg: 2 }} gap={6}>
        <Page.Section title="Volunteer">
          <VolunteerForm />
        </Page.Section>
        <DoorAccess />
      </Grid>
    </Page>
  )
}
