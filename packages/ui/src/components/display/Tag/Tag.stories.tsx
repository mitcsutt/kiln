import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { Stack } from '#components/layout/Stack'
import { Tag, TagList, type TagColor } from './Tag'

const meta = {
  title: 'UI/Display/Tag',
  component: Tag,
  args: { children: 'TypeScript' },
  argTypes: { color: { control: 'select', options: [undefined, 1, 2, 3, 4, 5, 6, 7, 8] } },
} satisfies Meta<typeof Tag>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Neutral tags for a project's stack — metadata, not status. */
export const Stack_: Story = {
  name: 'Project stack',
  render: () => (
    <TagList aria-label="Stack">
      <Tag>React</Tag>
      <Tag>TanStack Router</Tag>
      <Tag>TypeScript</Tag>
      <Tag>CSS Modules</Tag>
      <Tag>Vitest</Tag>
    </TagList>
  ),
}

const CATEGORIES: { label: string; color: TagColor }[] = [
  { label: 'Design', color: 1 },
  { label: 'Engineering', color: 2 },
  { label: 'Marketing', color: 3 },
  { label: 'Sales', color: 4 },
  { label: 'Support', color: 5 },
  { label: 'Finance', color: 6 },
  { label: 'Legal', color: 7 },
  { label: 'Other', color: 8 },
]

/** Categorical colours: departments, people. Ink is --color-cat-ink on every slot. */
export const Categories: Story = {
  render: () => (
    <TagList aria-label="Departments">
      {CATEGORIES.map((c) => (
        <Tag key={c.label} color={c.color}>
          {c.label}
        </Tag>
      ))}
    </TagList>
  ),
}

/** Active filters with a remove button each. */
export const Removable: Story = {
  render: function Render() {
    const [filters, setFilters] = useState(['Atlas redesign', 'Overdue', 'This quarter', 'Priya'])
    return (
      <Stack gap={3}>
        <TagList aria-label="Active filters">
          {filters.map((f) => (
            <Tag
              key={f}
              onRemove={() => {
                setFilters((all) => all.filter((x) => x !== f))
              }}
            >
              {f}
            </Tag>
          ))}
        </TagList>
        <TagList aria-label="Categories">
          <Tag color={1} onRemove={() => undefined}>
            Design
          </Tag>
          <Tag color={3} onRemove={() => undefined}>
            Marketing
          </Tag>
        </TagList>
      </Stack>
    )
  },
}

export const AsLinks: Story = {
  render: () => (
    <TagList aria-label="Filter articles by topic">
      <Tag asChild>
        <a href="#design-systems">Design systems</a>
      </Tag>
      <Tag asChild>
        <a href="#performance">Performance</a>
      </Tag>
      <Tag asChild color={3}>
        <a href="#accessibility">Accessibility</a>
      </Tag>
    </TagList>
  ),
}
