import { DragHandle } from '@mitcsutt/kiln-dnd'
import {
  Button,
  Card,
  Collapsible,
  Field,
  Inline,
  Kbd,
  RadioGroup,
  RadioGroupField,
  Slider,
  Stack,
  Text,
  toast,
} from '@mitcsutt/kiln-ui'
import { useState } from 'react'

/** Kiln 2's controller: programme, ramp and the rarely touched options, folded away. */
export function ControllerPanel() {
  const [programme, setProgramme] = useState('glaze')
  const [ramp, setRamp] = useState(108)
  const [hold, setHold] = useState('10')
  return (
    <Card variant="outline" padding={4}>
      <Stack gap={4}>
        <Inline gap={2} align="center" justify="between">
          <Text weight="strong">Kiln 2 controller</Text>
          <DragHandle />
        </Inline>
        <Field label="Programme">
          <RadioGroup value={programme} onValueChange={setProgramme} orientation="horizontal">
            <RadioGroup.Item value="bisque" label="Bisque" />
            <RadioGroup.Item value="glaze" label="Glaze" />
            <RadioGroup.Item value="crystal" label="Crystalline" />
          </RadioGroup>
        </Field>
        <Field label="Ramp rate" description={`${String(ramp)}°C an hour`}>
          <Slider value={ramp} onValueChange={setRamp} min={50} max={200} step={2} />
        </Field>
        <Collapsible>
          <Collapsible.Trigger>Hold and cooling</Collapsible.Trigger>
          <Collapsible.Content>
            <RadioGroupField
              label="Hold at the top"
              value={hold}
              onValueChange={setHold}
              options={[
                { value: '0', label: 'No hold' },
                { value: '10', label: '10 minutes' },
                { value: '30', label: '30 minutes', description: 'For matte glazes' },
              ]}
            />
          </Collapsible.Content>
        </Collapsible>
        <Inline gap={2} align="center" justify="between">
          <Text size="xs" tone="muted">
            Press <Kbd size="sm">Enter</Kbd> on a drag handle to move a panel.
          </Text>
          <Button
            size="sm"
            onClick={() => {
              toast({
                title: 'Sent to Kiln 2',
                description: `${programme}, ${String(ramp)}°C/h, hold ${hold} min`,
                tone: 'positive',
              })
            }}
          >
            Send to kiln
          </Button>
        </Inline>
      </Stack>
    </Card>
  )
}
