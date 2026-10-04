import type { Meta, StoryObj } from '@storybook/react-vite'
import { useEffect, useRef, useState } from 'react'
import { Stack } from '#components/layout/Stack'
import { Table } from '#components/display/Table'
import { Code } from '#components/typography/Code'
import { Text } from '#components/typography/Text'
import styles from './Foundations.module.css'

const meta = {
  title: 'UI/Foundations/Tokens',
  parameters: { layout: 'padded', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Every custom property the Paper rule sets: the theme contract, read from the stylesheet. */
function contractTokens(): string[] {
  const names = new Set<string>()
  const visit = (rules: CSSRuleList) => {
    for (const rule of Array.from(rules)) {
      if (rule instanceof CSSStyleRule && /\[data-theme=['"]paper['"]\]/.test(rule.selectorText)) {
        for (const name of Array.from(rule.style)) {
          if (name.startsWith('--')) names.add(name)
        }
      }
      if ('cssRules' in rule) visit((rule as CSSGroupingRule).cssRules)
    }
  }
  for (const sheet of Array.from(document.styleSheets)) {
    try {
      visit(sheet.cssRules)
    } catch {
      // A cross-origin sheet can't be read, and never holds Kiln's tokens.
    }
  }
  return [...names].sort()
}

function ContractTable() {
  const probe = useRef<HTMLDivElement>(null)
  const [rows, setRows] = useState<{ name: string; value: string }[]>([])

  useEffect(() => {
    const node = probe.current
    if (!node) return
    const computed = getComputedStyle(node)
    setRows(
      contractTokens().map((name) => ({ name, value: computed.getPropertyValue(name).trim() })),
    )
  }, [])

  return (
    <div ref={probe}>
      <Table density="compact">
        <Table.Caption>
          {rows.length} tokens: what every theme sets, with their values in this theme
        </Table.Caption>
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Token</Table.HeaderCell>
            <Table.HeaderCell>Value</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          {rows.map((row) => (
            <Table.Row key={row.name}>
              <Table.Cell rowHeader>
                <span className={styles.tokenName}>{row.name}</span>
              </Table.Cell>
              <Table.Cell>
                <span className={styles.tokenValue}>{row.value}</span>
              </Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table>
    </div>
  )
}

/**
 * The theme contract (DESIGN.md §3.2), listed from Paper's own rule and resolved in the
 * selected theme. A custom theme sets every one of these.
 */
export const Contract: Story = {
  render: () => (
    <Stack gap={5}>
      <Text tone="muted">
        Switch the theme in the toolbar to compare. Values that read <Code>light-dark()</Code>{' '}
        resolve to the current mode.
      </Text>
      <ContractTable />
    </Stack>
  ),
}

const radii = ['action', 'field', 'surface', 'media', 'chip', 'avatar'] as const

/** Radii are roles, not one global roundness. */
export const Shape: Story = {
  render: () => (
    <div className={styles.shapeGrid}>
      {radii.map((r) => (
        <div key={r} className={styles.shape} style={{ borderRadius: `var(--radius-${r})` }}>
          --radius-{r}
        </div>
      ))}
    </div>
  ),
}

const depths = ['--shadow-surface', '--shadow-float', '--shadow-overlay'] as const

/** Hairlines for anything static; soft shadows only for layers that float. */
export const Depth: Story = {
  render: () => (
    <div className={styles.shapeGrid}>
      {depths.map((d) => (
        <div
          key={d}
          className={styles.shape}
          style={{ boxShadow: `var(${d})`, borderRadius: 'var(--radius-surface)' }}
        >
          {d}
        </div>
      ))}
    </div>
  ),
}
