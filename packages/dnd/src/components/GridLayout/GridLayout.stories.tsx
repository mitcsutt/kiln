import type { Meta, StoryObj } from '@storybook/react-vite'
import { appendItem, DragHandle, GridLayout, removeItem, type GridItem } from '@mitcsutt/kiln-dnd'
import { Amount, Button, Card, Container, Inline, Numeral, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState, type ReactNode } from 'react'
import { expect, userEvent, waitFor, within } from 'storybook/test'

import { drag, expectAnnouncement, moveTo, storyRoot } from '#stories/play'

const meta = {
  title: 'Drag and drop/Components/GridLayout',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const dashboard: GridItem[] = [
  { i: 'revenue', x: 0, y: 0, w: 6, h: 2 },
  { i: 'orders', x: 6, y: 0, w: 3, h: 2 },
  { i: 'refunds', x: 9, y: 0, w: 3, h: 2 },
  { i: 'tickets', x: 0, y: 2, w: 4, h: 2 },
  { i: 'stock', x: 4, y: 2, w: 8, h: 2 },
]

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <Card padding={4}>
      <Stack gap={3}>
        <Inline gap={2} align="center" justify="between">
          <Text weight="strong">{title}</Text>
          <DragHandle />
        </Inline>
        {children}
      </Stack>
    </Card>
  )
}

const panels: Record<string, { title: string; body: ReactNode }> = {
  revenue: { title: 'Revenue', body: <Amount value={48210.4} currency="GBP" /> },
  orders: { title: 'Orders', body: <Numeral value={1284} /> },
  refunds: { title: 'Refunds', body: <Numeral value={37} /> },
  tickets: { title: 'Open tickets', body: <Numeral value={19} /> },
  stock: {
    title: 'Low stock',
    body: <Text size="sm">Oat milk, 1 L · Rye sourdough · Espresso beans, 1 kg</Text>,
  },
}

function Dashboard({ columns }: { columns?: number | Record<string, number> }) {
  const [layout, setLayout] = useState(dashboard)
  const [saves, setSaves] = useState(0)
  return (
    <Stack gap={4}>
      <GridLayout
        label="Sales dashboard"
        layout={layout}
        columns={columns}
        rowHeight={8}
        onChange={(next) => {
          setLayout(next)
          setSaves((count) => count + 1)
        }}
      >
        {dashboard.map(({ i }) => (
          <GridLayout.Item key={i} id={i} label={panels[i]?.title ?? i}>
            <Panel title={panels[i]?.title ?? i}>{panels[i]?.body}</Panel>
          </GridLayout.Item>
        ))}
      </GridLayout>
      <Text size="sm" tone="muted">
        Saved {saves} {saves === 1 ? 'time' : 'times'}.
      </Text>
    </Stack>
  )
}

const itemOf = (root: HTMLElement, name: string) =>
  within(root)
    .getByRole('button', { name: `Move ${name}` })
    .closest('[data-mode], [style*="--_x"]') as HTMLElement

const place = (item: HTMLElement) =>
  ['--_x', '--_y', '--_w', '--_h'].map((name) => Number(item.style.getPropertyValue(name)))

/**
 * Keyboard: arrows move one cell, Shift and the arrows resize one cell, Escape puts it all
 * back. The layout is saved once per drop.
 */
export const Playground: Story = {
  render: () => <Dashboard />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const handle = canvas.getByRole('button', { name: 'Move Open tickets' })
    await expect(handle).toHaveAccessibleDescription(/Shift and the arrow keys to resize/)
    handle.focus()
    await userEvent.keyboard(' ')
    await expectAnnouncement(
      root,
      'Picked up Open tickets, row 3, column 1, 4 columns wide and 2 rows tall.',
    )
    await userEvent.keyboard('{ArrowRight}')
    await expectAnnouncement(root, 'Open tickets moved to row 3, column 2.')
    await userEvent.keyboard('{Shift>}{ArrowDown}{/Shift}')
    await expectAnnouncement(root, 'Open tickets is now 4 columns wide and 3 rows tall.')
    await expect(place(itemOf(root, 'Open tickets'))).toEqual([1, 2, 4, 3])
    await userEvent.keyboard('{Escape}')
    await expectAnnouncement(
      root,
      'Move cancelled. Open tickets is back at row 3, column 1, 4 columns wide and 2 rows tall.',
    )
    await expect(place(itemOf(root, 'Open tickets'))).toEqual([0, 2, 4, 2])
    await expect(canvas.getByText('Saved 0 times.')).toBeInTheDocument()

    await userEvent.keyboard(' {Shift>}{ArrowRight}{ArrowRight}{/Shift}{Enter}')
    await expectAnnouncement(
      root,
      'Dropped Open tickets at row 3, column 1, 6 columns wide and 2 rows tall.',
    )
    await expect(canvas.getByText('Saved 1 time.')).toBeInTheDocument()
    await expect(canvas.getByRole('button', { name: 'Move Open tickets' })).toHaveFocus()
  },
}

/**
 * A layout is plain data: one `{ i, x, y, w, h }` per item, in columns and rows. Each
 * `GridLayout.Item` is dragged by the `DragHandle` inside it, and resized from its corner.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    return (
      <GridLayout
        label="Sales dashboard"
        defaultLayout={[
          { i: 'revenue', x: 0, y: 0, w: 8, h: 2 },
          { i: 'orders', x: 8, y: 0, w: 4, h: 2 },
          { i: 'tickets', x: 0, y: 2, w: 12, h: 1 },
        ]}
        rowHeight={8}
      >
        <GridLayout.Item id="revenue" label="Revenue">
          <Card padding={4}>
            <Inline gap={2} align="center" justify="between">
              <Text weight="strong">Revenue</Text>
              <DragHandle />
            </Inline>
            <Amount value={48210.4} currency="GBP" />
          </Card>
        </GridLayout.Item>
        <GridLayout.Item id="orders" label="Orders">
          <Card padding={4}>
            <Inline gap={2} align="center" justify="between">
              <Text weight="strong">Orders</Text>
              <DragHandle />
            </Inline>
            <Numeral value={1284} />
          </Card>
        </GridLayout.Item>
        <GridLayout.Item id="tickets" label="Open tickets">
          <Card padding={4}>
            <Inline gap={2} align="center" justify="between">
              <Text weight="strong">Open tickets: 19</Text>
              <DragHandle />
            </Inline>
          </Card>
        </GridLayout.Item>
      </GridLayout>
    )
  },
}

/**
 * Own the layout to store it: `onChange` fires once per drop. `appendItem` and
 * `removeItem` change it in your own code and close the gaps they leave.
 */
export const Controlled: Story = {
  tags: ['docs'],
  render: function Controlled() {
    const [layout, setLayout] = useState<GridItem[]>([
      { i: 'revenue', x: 0, y: 0, w: 6, h: 2 },
      { i: 'orders', x: 6, y: 0, w: 6, h: 2 },
    ])
    const hasRefunds = layout.some((item) => item.i === 'refunds')
    return (
      <Stack gap={4}>
        <Inline gap={3}>
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setLayout((current) =>
                hasRefunds
                  ? removeItem(current, 'refunds', { columns: 12 })
                  : appendItem(current, { i: 'refunds', w: 4, h: 2 }, { columns: 12 }),
              )
            }}
          >
            {hasRefunds ? 'Remove refunds' : 'Add refunds'}
          </Button>
        </Inline>
        <GridLayout label="Sales dashboard" layout={layout} onChange={setLayout} rowHeight={8}>
          {layout.map((item) => (
            <GridLayout.Item key={item.i} id={item.i} label={item.i}>
              <Card padding={4}>
                <Inline gap={2} align="center" justify="between">
                  <Text weight="strong">{item.i}</Text>
                  <DragHandle />
                </Inline>
              </Card>
            </GridLayout.Item>
          ))}
        </GridLayout>
      </Stack>
    )
  },
}

/**
 * Give `columns` per breakpoint and the grid picks its column count from its own width.
 * You store one layout, for the widest; narrower ones are generated from it and can't be
 * rearranged. This one sits in a narrow container, so it shows 4 columns.
 */
export const Responsive: Story = {
  tags: ['docs'],
  render: function Responsive() {
    return (
      <Container width="narrow">
        <GridLayout
          label="Sales dashboard"
          columns={{ base: 4, md: 8, lg: 12 }}
          defaultLayout={[
            { i: 'revenue', x: 0, y: 0, w: 6, h: 2 },
            { i: 'orders', x: 6, y: 0, w: 6, h: 2 },
          ]}
          rowHeight={8}
        >
          <GridLayout.Item id="revenue" label="Revenue">
            <Card padding={4}>
              <Inline gap={2} align="center" justify="between">
                <Text weight="strong">Revenue</Text>
                <DragHandle />
              </Inline>
            </Card>
          </GridLayout.Item>
          <GridLayout.Item id="orders" label="Orders">
            <Card padding={4}>
              <Inline gap={2} align="center" justify="between">
                <Text weight="strong">Orders</Text>
                <DragHandle />
              </Inline>
            </Card>
          </GridLayout.Item>
        </GridLayout>
      </Container>
    )
  },
}

/** Narrow: 4 columns generated from the 12-column layout, and rearranging waits for width. */
export const ResponsiveSwitch: Story = {
  render: () => (
    <Container width="narrow">
      <Dashboard columns={{ base: 4, md: 8, lg: 12 }} />
    </Container>
  ),
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    await waitFor(async () => {
      await expect(place(itemOf(root, 'Revenue'))).toEqual([0, 0, 4, 2])
    })
    await expect(place(itemOf(root, 'Orders'))).toEqual([1, 2, 3, 2])
    const handle = canvas.getByRole('button', { name: 'Move Revenue' })
    await expect(handle).toHaveAttribute('aria-disabled', 'true')
    handle.focus()
    await userEvent.keyboard(' ')
    await expectAnnouncement(root, 'Revenue can be moved when the grid is wider.')
  },
}

/**
 * Pointer: the panel follows the pointer, a placeholder shows where it lands and the
 * others make room. The layout changes once, on drop.
 */
export const PointerDrag: Story = {
  render: () => <Dashboard />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const handle = canvas.getByRole('button', { name: 'Move Open tickets' })
    const stock = itemOf(root, 'Low stock').getBoundingClientRect()
    const start = handle.getBoundingClientRect()
    const drop = await drag(
      handle,
      { x: start.left + start.width / 2 + stock.width / 2, y: start.top + start.height / 2 },
      { keepHolding: true },
    )
    const grid = canvas.getByRole('group', { name: 'Sales dashboard' })
    await waitFor(async () => {
      await expect(grid.querySelector('[aria-hidden="true"][style*="--_x"]')).not.toBeNull()
    })
    await expect(itemOf(root, 'Open tickets')).toHaveAttribute('data-dragging', 'pointer')
    await expect(canvas.getByText('Saved 0 times.')).toBeInTheDocument()
    await drop()
    await waitFor(async () => {
      await expect(canvas.getByText('Saved 1 time.')).toBeInTheDocument()
    })
    const [x] = place(itemOf(root, 'Open tickets'))
    await expect(x).toBeGreaterThan(0)
    await expect(itemOf(root, 'Open tickets')).not.toHaveAttribute('data-dragging')
  },
}

/** Pointer: the corner grip resizes, one cell at a time, and saves on release. */
export const CornerResize: Story = {
  render: () => <Dashboard />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const item = itemOf(root, 'Revenue')
    const grip = item.querySelector('[data-kiln-dnd-resize]') as HTMLElement
    const rect = item.getBoundingClientRect()
    const columnWidth = rect.width / 6
    const drop = await drag(
      grip,
      { x: rect.right - columnWidth * 2, y: rect.bottom + 4 },
      { keepHolding: true },
    )
    await moveTo({ x: rect.right - columnWidth * 2, y: rect.bottom + 4 })
    await waitFor(async () => {
      await expect(place(itemOf(root, 'Revenue'))[2]).toBe(4)
    })
    await drop()
    await waitFor(async () => {
      await expect(canvas.getByText('Saved 1 time.')).toBeInTheDocument()
    })
    await expect(place(itemOf(root, 'Revenue'))).toEqual([0, 0, 4, 2])
  },
}

/** Items slide into place, unless the reader asks for reduced motion. */
export const ReducedMotion: Story = {
  render: () => <Dashboard />,
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const item = itemOf(root, 'Revenue')
    const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    const duration = getComputedStyle(item).transitionDuration
    if (reduce) await expect(duration).toMatch(/^0s/)
    else await expect(duration).not.toMatch(/^0s(, 0s)*$/)
    // The reduced-motion rule is loaded and targets the items, whichever mode this runs in.
    const itemClass = [...item.classList].find((name) => name.includes('item')) ?? ''
    const rules = [...document.styleSheets].flatMap((sheet) => {
      try {
        return [...sheet.cssRules]
      } catch {
        return []
      }
    })
    const reducedRule = rules
      .filter((rule): rule is CSSMediaRule => rule instanceof CSSMediaRule)
      .filter((rule) => rule.conditionText.includes('prefers-reduced-motion: reduce'))
      .flatMap((rule) => [...rule.cssRules])
      .find(
        (rule): rule is CSSStyleRule =>
          rule instanceof CSSStyleRule && rule.selectorText.includes(itemClass),
      )
    await expect(reducedRule?.style.transition).toBe('none')
  },
}
