import {
  Avatar,
  AvatarGroup,
  Badge,
  Card,
  Inline,
  Media,
  Rating,
  Stack,
  Text,
} from '@mitcsutt/kiln-ui'

import bowl from '#assets/bowl.svg'
import mug from '#assets/mug.svg'
import vase from '#assets/vase.svg'
import { LEVEL_LABELS, type Workshop } from '#features/community/data/workshops'

import { BookingDialog } from './components/BookingDialog'

const ART = { bowl, vase, mug }
const ALT = {
  bowl: 'A wide blue bowl',
  vase: 'A tall green vase',
  mug: 'A pink mug with a pulled handle',
}
const ATTENDEES = ['Priya Shah', 'Callum Reid', 'Mei Tanaka', 'Josh Bello', 'Ana Ruiz', 'Sam Holt']

const when = new Intl.DateTimeFormat('en-GB', {
  weekday: 'short',
  day: 'numeric',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

export function WorkshopCard({ workshop }: { workshop: Workshop }) {
  const left = workshop.spaces - workshop.booked
  return (
    <Card variant="outline">
      <Media src={ART[workshop.art]} alt={ALT[workshop.art]} ratio="16/9" />
      <Card.Header>
        <Card.Title>{workshop.title}</Card.Title>
        <Card.Meta>
          {when.format(new Date(workshop.date))}, £{workshop.price}
        </Card.Meta>
      </Card.Header>
      <Card.Body>
        <Stack gap={3}>
          <Text size="sm">{workshop.blurb}</Text>
          <Inline gap={2} align="center">
            <Rating
              aria-label={`Rated ${workshop.rating} out of 5`}
              value={Math.round(workshop.rating)}
              readOnly
              size="sm"
            />
            <Text size="sm" tone="muted">
              {workshop.rating.toFixed(1)}
            </Text>
          </Inline>
          <Badge variant="outline">{LEVEL_LABELS[workshop.level]}</Badge>
          <Inline gap={2} align="center">
            <AvatarGroup max={3} aria-label={`${workshop.booked} people booked`}>
              {ATTENDEES.slice(0, workshop.booked).map((name) => (
                <Avatar key={name} name={name} size="sm" />
              ))}
            </AvatarGroup>
            <Text size="sm" tone={left === 0 ? 'critical' : 'muted'}>
              {left === 0 ? 'Full' : `${left} of ${workshop.spaces} left`}
            </Text>
          </Inline>
        </Stack>
      </Card.Body>
      <Card.Footer>
        <BookingDialog workshop={workshop} />
      </Card.Footer>
    </Card>
  )
}
