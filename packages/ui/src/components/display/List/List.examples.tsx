import { Amount, Avatar, ChevronRightIcon, List, Text } from '@mitcsutt/kiln-ui'

const TRIPS = [
  { who: 'Ines Varga', route: 'Harbour Square to Kelso Bay', when: 'Today, 07:10', fare: 4.2 },
  { who: 'Tomasz Okoro', route: 'Old Quay to Northpoint', when: 'Today, 08:45', fare: 2.8 },
  { who: 'Priya Halvorsen', route: 'Marram Point to Harbour Square', when: 'Yesterday', fare: 6.5 },
]

export function Usage() {
  return (
    <List>
      {TRIPS.map((trip) => (
        <List.Item key={trip.who}>
          <List.Leading>
            <Avatar name={trip.who} size="sm" />
          </List.Leading>
          <List.Content>
            <Text weight="medium">{trip.route}</Text>
            <List.Description>
              {trip.who}, {trip.when}
            </List.Description>
          </List.Content>
          <List.Trailing>
            <Amount value={trip.fare} currency="GBP" locale="en-GB" />
          </List.Trailing>
        </List.Item>
      ))}
    </List>
  )
}

const LINES = ['Coastal line', 'Harbour loop', 'Market shuttle']

export function Interactive() {
  return (
    <List density="compact">
      {LINES.map((line, index) => (
        <List.Item key={line} interactive asChild selected={index === 0}>
          <a href={`#${line.toLowerCase().replace(/ /g, '-')}`}>
            <List.Content>
              <Text weight="medium">{line}</Text>
            </List.Content>
            <List.Trailing>
              <ChevronRightIcon />
            </List.Trailing>
          </a>
        </List.Item>
      ))}
    </List>
  )
}
