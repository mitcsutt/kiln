'use client'

import { Card, Media } from '@mitcsutt/kiln-ui'

export default function Linked() {
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
