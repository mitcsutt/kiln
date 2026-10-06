import type { Meta, StoryObj } from '@storybook/react-vite'
import { Form, useAppForm, useServerValues } from '@mitcsutt/kiln-forms'
import { Button, Stack, Text } from '@mitcsutt/kiln-ui'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import { kit } from '#kit/defaultKit'

const meta = {
  title: 'Forms/Hooks/useServerValues',
  parameters: { controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface Venue {
  name: string
  capacity: number | null
}

const LOADED: Venue = { name: 'Mill Lane hall', capacity: 120 }
const VERSIONS: Venue[] = [LOADED, { name: 'Mill Lane hall', capacity: 140 }]

function VenueEditor() {
  const [version, setVersion] = useState(0)
  const data = VERSIONS[version]
  const form = kit.useAppForm({ defaultValues: LOADED })
  useServerValues(form, data)
  return (
    <Stack gap={5}>
      <Form form={form} aria-label="Venue">
        <Stack gap={5}>
          <form.TextField name="name" label="Venue name" />
          <form.NumberField name="capacity" label="Capacity" min={0} />
        </Stack>
      </Form>
      <Text size="sm" tone="muted">
        Server version {version + 1} of {VERSIONS.length}
      </Text>
      <div>
        <Button
          variant="outline"
          tone="neutral"
          disabled={version === VERSIONS.length - 1}
          onClick={() => {
            setVersion((v) => v + 1)
          }}
        >
          Load the newer version
        </Button>
      </div>
    </Stack>
  )
}

/**
 * Edit the venue name, then load the newer version from the "server": the capacity
 * updates, and your edit to the name is kept.
 */
export const Playground: Story = {
  render: () => <VenueEditor />,
  play: async ({ canvasElement }) => {
    const canvas = within(storyRoot(canvasElement))
    const name = canvas.getByLabelText('Venue name')
    await userEvent.clear(name)
    await userEvent.type(name, 'Mill Lane main hall')
    await userEvent.click(canvas.getByRole('button', { name: 'Load the newer version' }))
    await expect(canvas.getByLabelText('Capacity')).toHaveValue('140')
    await expect(name).toHaveValue('Mill Lane main hall')
  },
}

interface Line {
  name: string
  frequency: number | null
}

/**
 * After a save that rebaselines, a refetch returning the saved values leaves the form clean.
 * `keepDirty` and `keepErrors` (both on by default) decide whether edits and visible errors
 * survive a refresh. An error survives only on a value the refresh kept, and it stays visible
 * whatever `errorVisibility` says. An error a submit or a step's Next had quieted isn't announced
 * again; later edits to a field that was never quieted are still announced. A field that takes a
 * new server value drops the error its old value had.
 */
export const Usage: Story = {
  tags: ['docs'],
  render: function Usage() {
    // Stands in for data from a query that refetches.
    const [server, setServer] = useState<Line>({ name: 'Coastal line', frequency: 20 })
    const form = useAppForm<Line>({ defaultValues: server })
    useServerValues(form, server)
    return (
      <Form form={form} aria-label="Line">
        <Stack gap={5}>
          <form.TextField name="name" label="Line name" />
          <form.NumberField name="frequency" label="Every (minutes)" min={5} />
          <Text size="sm" tone="muted">
            Edit the name, then refetch: the frequency updates, and your edit is kept.
          </Text>
          <Button
            variant="outline"
            tone="neutral"
            onClick={() => {
              setServer((line) => ({ ...line, frequency: (line.frequency ?? 20) === 20 ? 15 : 20 }))
            }}
          >
            Refetch from the server
          </Button>
        </Stack>
      </Form>
    )
  },
}
