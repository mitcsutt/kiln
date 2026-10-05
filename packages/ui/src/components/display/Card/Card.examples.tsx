import { Badge, Button, Card, Grid, Inline, Media, Text } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Grid minItemWidth="sm" gap={4}>
      <Card>
        <Card.Header>
          <Card.Title>Coastal line</Card.Title>
          <Card.Meta>Every 20 min</Card.Meta>
        </Card.Header>
        <Card.Body>
          <Text tone="muted">Harbour Square to Marram Point, calling at six piers.</Text>
        </Card.Body>
        <Card.Footer>
          <Inline justify="between">
            <Badge tone="positive">Good service</Badge>
            <Button size="sm" variant="outline" tone="neutral">
              Timetable
            </Button>
          </Inline>
        </Card.Footer>
      </Card>
      <Card variant="raised">
        <Card.Header>
          <Card.Title>Night bus N14</Card.Title>
          <Card.Meta>Until 04:40</Card.Meta>
        </Card.Header>
        <Card.Description>Runs every night of the week, including holidays.</Card.Description>
      </Card>
    </Grid>
  )
}

export function Linked() {
  return (
    <Card asChild interactive>
      <a href="#coastal-path">
        <Card.Media>
          <Media src="/images/harbour.svg" alt="The ferry pier at Harbour Square" ratio="16/9" />
        </Card.Media>
        <Card.Header>
          <Card.Title>Walk the coastal path</Card.Title>
          <Card.Meta>11 km</Card.Meta>
        </Card.Header>
        <Card.Description>Take the 08:10 ferry out and the bus back.</Card.Description>
      </a>
    </Card>
  )
}
