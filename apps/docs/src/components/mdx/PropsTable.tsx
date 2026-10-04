'use client'

import { Badge, Code, Stack, Table, Text } from '@mitcsutt/kiln-ui'
import type { ApiProp } from '@/lib/api'
import { inlineCode } from '@/lib/inlineCode'
import styles from './PropsTable.module.css'

export function PropsTable({
  name,
  props,
  inherits,
  caption,
}: {
  name: string
  props: ApiProp[]
  inherits: string[]
  caption?: string
}) {
  return (
    <Stack gap={3} className={styles.wrap} data-kiln-component="props-table">
      {caption ? (
        <Text as="p" weight="strong">
          <Code>{caption}</Code>
        </Text>
      ) : null}
      {props.length ? (
        <Table density="compact" label={`${name} props`}>
          <Table.Head>
            <Table.Row>
              <Table.HeaderCell>Prop</Table.HeaderCell>
              <Table.HeaderCell>Type</Table.HeaderCell>
              <Table.HeaderCell>Default</Table.HeaderCell>
              <Table.HeaderCell width="fill">Description</Table.HeaderCell>
            </Table.Row>
          </Table.Head>
          <Table.Body>
            {props.map((prop) => (
              <Table.Row key={prop.name}>
                <Table.Cell rowHeader className={styles.name}>
                  <Stack gap={1} align="start">
                    <Code>{prop.name}</Code>
                    {prop.required ? (
                      <Badge size="sm" tone="caution">
                        Required
                      </Badge>
                    ) : null}
                  </Stack>
                </Table.Cell>
                <Table.Cell className={styles.type}>
                  <Code>{prop.type}</Code>
                </Table.Cell>
                <Table.Cell>{prop.default ? <Code>{prop.default}</Code> : '—'}</Table.Cell>
                <Table.Cell className={styles.description}>
                  {prop.description ? inlineCode(prop.description) : null}
                </Table.Cell>
              </Table.Row>
            ))}
          </Table.Body>
        </Table>
      ) : null}
      {inherits.length ? (
        <Text as="p" size="sm" tone="muted">
          {props.length ? 'Also accepts' : 'Accepts'} every prop of{' '}
          {inherits.map((type, index) => (
            <span key={type}>
              {index > 0 ? ' and ' : null}
              <Code>{type}</Code>
            </span>
          ))}
          .
        </Text>
      ) : null}
    </Stack>
  )
}
