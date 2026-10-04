'use client'

import { Code, CodeBlock, Stack, Table, Text } from '@mitcsutt/kiln-ui'
import { inlineCode } from '@/lib/inlineCode'
import styles from './Specimens.module.css'

export interface TokenGroup {
  title: string
  tokens: { name: string; value: string }[]
}

/** The whole contract, grouped as Paper groups it, with Paper's value for each token. */
export function TokenReference({ groups }: { groups: TokenGroup[] }) {
  return (
    <Stack gap={6} data-kiln-component="token-reference" className={styles.reference}>
      {groups.map((group) => (
        <Stack key={group.title} gap={3}>
          <Text as="p" weight="strong">
            {group.title} ({group.tokens.length})
          </Text>
          <Table density="compact" label={`${group.title} tokens`}>
            <Table.Head>
              <Table.Row>
                <Table.HeaderCell>Token</Table.HeaderCell>
                <Table.HeaderCell width="fill">Paper</Table.HeaderCell>
              </Table.Row>
            </Table.Head>
            <Table.Body>
              {group.tokens.map((token) => (
                <Table.Row key={token.name}>
                  <Table.Cell rowHeader className={styles.tokenName}>
                    <Code>{token.name}</Code>
                  </Table.Cell>
                  <Table.Cell className={styles.tokenValue}>
                    <Code>{token.value}</Code>
                  </Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table>
        </Stack>
      ))}
    </Stack>
  )
}

export function OptionalTokens({ names }: { names: string[] }) {
  return (
    <Text as="p" data-kiln-component="optional-tokens">
      {names.map((name, index) => (
        <span key={name}>
          {index ? ', ' : null}
          <Code>{name}</Code>
        </span>
      ))}
    </Text>
  )
}

export function StarterTheme({ css }: { css: string }) {
  return <CodeBlock code={css} language="CSS" title="harbour.css" className={styles.starter} />
}

export function ComponentTokenTable({
  name,
  tokens,
}: {
  name: string
  tokens: { name: string; description: string }[]
}) {
  return (
    <Table
      density="compact"
      label={`${name} component tokens`}
      data-kiln-component="component-tokens"
    >
      <Table.Head>
        <Table.Row>
          <Table.HeaderCell>Token</Table.HeaderCell>
          <Table.HeaderCell width="fill">Default and use</Table.HeaderCell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {tokens.map((token) => (
          <Table.Row key={token.name}>
            <Table.Cell rowHeader className={styles.tokenName}>
              <Code>{token.name}</Code>
            </Table.Cell>
            <Table.Cell>{inlineCode(token.description)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  )
}
