'use client'

import { Badge, Button, Card, Grid, Inline, Text } from '@mitcsutt/kiln-ui'

export default function Usage() {
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
