import {
  Accordion,
  ChipGroup,
  ChoiceCards,
  Combobox,
  Container,
  EmptyState,
  Grid,
  Marquee,
  Page,
  Quote,
  Section,
  ShowMore,
  Stack,
  Text,
} from '@mitcsutt/kiln-ui'
import { useState } from 'react'

import { PageHeader } from '#components/PageHeader'
import {
  FAQS,
  REVIEWS,
  type Workshop,
  type WorkshopLevel,
} from '#features/community/data/workshops'

import { ShowYourWork } from './components/ShowYourWork'
import { WorkshopCard } from './components/WorkshopCard'

const LEVELS: { value: WorkshopLevel; label: string }[] = [
  { value: 'beginner', label: 'Beginner' },
  { value: 'improver', label: 'Improver' },
  { value: 'confident', label: 'Confident' },
]

const STORY =
  'Slipcast started in 2019 as four wheels in a railway arch and a kiln bought from a school clearance. ' +
  'Now there are fourteen wheels, three kilns and a waiting list, but the rule is the same: anyone can learn, ' +
  'and anyone who has learned teaches. Every host on this page came to a beginner night once. Most of them ' +
  'made something wonky, and one of them still uses it as a pen pot on the front desk.'

/** Riso: posters, workshops and the gallery wall. Loud ink, real people. */
export function Workshops({ workshops }: { workshops: Workshop[] }) {
  const [levels, setLevels] = useState<string[]>([])
  const [host, setHost] = useState<string | null>(null)
  const [length, setLength] = useState('any')
  const shown = workshops.filter(
    (workshop) =>
      (levels.length === 0 || levels.includes(workshop.level)) &&
      (host === null || workshop.host === host),
  )
  return (
    <Page>
      <PageHeader
        kicker="Community"
        title="Workshops"
        description="Evening classes run by members, for anyone who wants muddy hands."
        theme="riso"
      />
      <Marquee
        label="What's on"
        items={workshops.map((workshop) => `${workshop.title} with ${workshop.host}`)}
        speed="slow"
        separator="·"
      />
      <Stack gap={4}>
        <ChipGroup
          type="multiple"
          aria-label="Level"
          options={LEVELS}
          value={levels}
          onValueChange={setLevels}
        />
        <Combobox
          aria-label="Host"
          placeholder="Any host"
          options={[...new Set(workshops.map((workshop) => workshop.host))].map((name) => ({
            value: name,
            label: name,
          }))}
          value={host}
          onValueChange={setHost}
          clearable
        />
        <ChoiceCards
          aria-label="Session length"
          type="single"
          value={length}
          onValueChange={setLength}
          columns={{ base: 1, sm: 3 }}
          options={[
            { value: 'any', label: 'Any length' },
            { value: 'evening', label: 'One evening', description: 'Three hours' },
            {
              value: 'course',
              label: 'A course',
              description: 'Six weeks, coming in spring',
              disabled: true,
            },
          ]}
        />
      </Stack>
      {shown.length === 0 ? (
        <EmptyState title="No workshops match" description="Clear a filter to see them all." />
      ) : (
        <Grid columns={{ base: 1, md: 2, lg: 3 }} gap={5}>
          {shown.map((workshop) => (
            <WorkshopCard key={workshop.id} workshop={workshop} />
          ))}
        </Grid>
      )}
      <Section space={6} surface="inverse" divider="top">
        <Container width="full">
          <Page.Section title="What people said">
            <Grid columns={{ base: 1, md: 2 }} gap={6}>
              {REVIEWS.map((review) => (
                <Quote key={review.id} size="sm" cite={`${review.name}, ${review.workshop}`}>
                  {review.quote}
                </Quote>
              ))}
            </Grid>
          </Page.Section>
        </Container>
      </Section>
      <Page.Section title="How Slipcast started">
        <ShowMore lines={2}>
          <Text measure="text">{STORY}</Text>
        </ShowMore>
      </Page.Section>
      <Page.Section title="Questions">
        <Accordion type="single" collapsible>
          {FAQS.map((faq) => (
            <Accordion.Item key={faq.id} value={faq.id}>
              <Accordion.Trigger>{faq.question}</Accordion.Trigger>
              <Accordion.Content>
                <Text>{faq.answer}</Text>
              </Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion>
      </Page.Section>
      <Page.Section title="Show your work" description="Put a piece forward for the gallery wall.">
        <ShowYourWork />
      </Page.Section>
    </Page>
  )
}
