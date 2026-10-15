import type { Meta, StoryObj } from '@storybook/react-vite'
import { Prose, ShowMore, Stack, Tag, TagList, Text } from '@mitcsutt/kiln-ui'
import { expect, userEvent, waitFor, within } from 'storybook/test'
import { storyRoot } from '#components/_story/storyRoot'

const BIO =
  'Mara Lindqvist runs the accounts desk at Harbour Works, a cooperative of eleven boatyards on the Firth of Forth. She moved the yards from paper day books to shared ledgers in 2019, and now closes the month in two days instead of nine. Before that she spent six years auditing fisheries grants for the regional council, which is where she learned to read a hull survey and a balance sheet with the same suspicion. She answers supplier questions on Tuesday and Thursday mornings.'

const meta = {
  title: 'UI/Layout/ShowMore',
  component: ShowMore,
  args: { lines: 3 },
  render: (args) => (
    <ShowMore {...args}>
      <Text measure="text">{BIO}</Text>
    </ShowMore>
  ),
} satisfies Meta<typeof ShowMore>

export default meta
type Story = StoryObj<typeof meta>

/** Try `lines`, `maxHeight` and `maxItems` in the controls. */
export const Playground: Story = {}

/**
 * Wrap the content and say how much of it to show. With `lines`, the cut falls after that many
 * lines of the text, and the toggle appears only if there's more.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: () => (
    <ShowMore lines={3}>
      <Text measure="text">{BIO}</Text>
    </ShowMore>
  ),
  play: async ({ canvasElement }) => {
    const root = storyRoot(canvasElement)
    const canvas = within(root)
    const toggle = await canvas.findByRole('button', { name: 'Show more' })
    const id = CSS.escape(String(toggle.getAttribute('aria-controls')))
    const clip = root.querySelector<HTMLElement>(`#${id}`)
    const clamped = clip?.getBoundingClientRect().height ?? 0
    await userEvent.click(toggle)
    await expect(toggle).toHaveAttribute('aria-expanded', 'true')
    await expect(toggle).toHaveAccessibleName('Show less')
    await waitFor(() =>
      expect(clip?.getBoundingClientRect().height ?? 0).toBeGreaterThan(clamped * 1.5),
    )
  },
}

/**
 * Short content renders as it is: no toggle and no fade.
 */
export const ShortContent: Story = {
  tags: ['docs'],
  render: () => (
    <ShowMore lines={3}>
      <Text>Answers supplier questions on Tuesday and Thursday mornings.</Text>
    </ShowMore>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await expect(canvas.queryByRole('button')).not.toBeInTheDocument()
  },
}

/**
 * `maxHeight` clamps anything that isn't plain lines of text, like prose with a heading and a
 * list, to a step on the space scale.
 */
export const MaxHeight: Story = {
  tags: ['docs'],
  render: () => (
    <ShowMore maxHeight={10}>
      <Prose>
        <h3>What changed in March</h3>
        <p>
          The billing run moves to the first working day of each month, so invoices for a weekend
          start date go out on the Monday.
        </p>
        <ul>
          <li>Late fees now start on day eight, not day five.</li>
          <li>Card payments settle the next working day.</li>
          <li>Statements include the yard each invoice came from.</li>
        </ul>
        <p>Nothing changes for direct debits.</p>
      </Prose>
    </ShowMore>
  ),
}

const SKILLS = [
  'Rigging',
  'Hull survey',
  'Fibreglass repair',
  'Diesel engines',
  'Electrics',
  'Sail making',
  'Varnishing',
  'Welding',
  'Joinery',
  'Antifouling',
  'Outboards',
  'Winter storage',
]

/**
 * `maxItems` shows the first few items of the list it wraps, the children of its one child, and
 * the toggle says how many more there are.
 */
export const MaxItems: Story = {
  tags: ['docs'],
  render: () => (
    <Stack gap={2}>
      <Text weight="medium">Skills at the Granton yard</Text>
      <ShowMore maxItems={6}>
        <TagList>
          {SKILLS.map((skill) => (
            <Tag key={skill}>{skill}</Tag>
          ))}
        </TagList>
      </ShowMore>
    </Stack>
  ),
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    await expect(canvas.queryByText('Joinery')).not.toBeVisible()
    await userEvent.click(canvas.getByRole('button', { name: 'Show 6 more' }))
    await expect(canvas.getByText('Joinery')).toBeVisible()
  },
}
