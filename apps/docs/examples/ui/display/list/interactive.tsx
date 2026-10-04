'use client'

import { ChevronRightIcon, List, Text } from '@mitcsutt/kiln-ui'

const LINES = ['Coastal line', 'Harbour loop', 'Market shuttle']

export default function Interactive() {
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
