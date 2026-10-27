import { Dnd, Draggable, DropZone } from '@mitcsutt/kiln-dnd'
import { Badge, Card, Grid, Inline, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'

import { PIECES, type Piece } from '#features/firings/data/kilns'

const KILNS = [
  { id: 'k1', label: 'Kiln 1', takes: 'glaze' },
  { id: 'k3', label: 'Kiln 3, bisque only', takes: 'bisque' },
] as const

/** Drag a piece onto the kiln it goes in. Kiln 3 refuses glazeware. */
export function LoadingBay() {
  const [placed, setPlaced] = useState<Record<string, string>>({})
  const waiting = PIECES.filter((piece) => !placed[piece.id])
  return (
    <Dnd>
      <Stack gap={4}>
        <Inline gap={3}>
          {waiting.map((piece) => (
            <Draggable key={piece.id} id={piece.id} label={piece.name} data={piece}>
              <Card padding={3}>
                <Stack gap={1}>
                  <Text size="sm" weight="medium">
                    {piece.name}
                  </Text>
                  <Badge variant="outline">{piece.stage}</Badge>
                </Stack>
              </Card>
            </Draggable>
          ))}
          {waiting.length === 0 ? <Text tone="muted">Every piece has a kiln.</Text> : null}
        </Inline>
        <Grid columns={{ base: 1, md: 2 }} gap={4}>
          {KILNS.map((kiln) => (
            <DropZone
              key={kiln.id}
              id={kiln.id}
              label={kiln.label}
              accept={(item) => (item.data as Piece).stage === kiln.takes}
              onDrop={(item) => {
                setPlaced((current) => ({ ...current, [item.id]: kiln.id }))
              }}
            >
              <Stack gap={2}>
                <Text weight="strong">{kiln.label}</Text>
                {PIECES.filter((piece) => placed[piece.id] === kiln.id).map((piece) => (
                  <Text key={piece.id} size="sm">
                    {piece.name}, {piece.maker}
                  </Text>
                ))}
              </Stack>
            </DropZone>
          ))}
        </Grid>
      </Stack>
    </Dnd>
  )
}
