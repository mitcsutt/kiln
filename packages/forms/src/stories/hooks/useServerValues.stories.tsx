import { Button, Stack, Text } from '@mitcsutt/kiln-ui'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'
import { expect, userEvent, within } from 'storybook/test'
import { storyRoot } from '#stories/_kit'
import { Form } from '#components/Form'
import { useServerValues } from '#core/hooks'
import { kit } from '#kit'

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
