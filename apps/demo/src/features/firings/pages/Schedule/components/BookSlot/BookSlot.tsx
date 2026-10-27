import {
  Button,
  Calendar,
  Card,
  CheckboxField,
  CheckboxGroup,
  CheckboxGroupField,
  DateField,
  DateInput,
  DateTimeField,
  DateTimeInput,
  Field,
  Fieldset,
  Grid,
  Stack,
  Text,
  TimeField,
  TimeInput,
  toast,
} from '@mitcsutt/kiln-ui'
import { useState } from 'react'

const BOOKED = new Set(['2026-10-29', '2026-10-30', '2026-11-03'])

/** Book a kiln slot, and log a firing by hand when a controller is offline. */
export function BookSlot() {
  const [day, setDay] = useState('2026-10-31')
  const [start, setStart] = useState('18:00')
  const [unload, setUnload] = useState('2026-11-01T14:00')
  const [needs, setNeeds] = useState<string[]>(['wax'])
  const [present, setPresent] = useState(true)
  const [logDay, setLogDay] = useState('2026-10-26')
  const [logTime, setLogTime] = useState('21:40')
  const [logDone, setLogDone] = useState('2026-10-27T09:15')
  const [logChecks, setLogChecks] = useState<string[]>([])
  const [reviewBy, setReviewBy] = useState('2026-11-07')
  return (
    <Grid columns={{ base: 1, lg: 2 }} gap={5}>
      <Card variant="outline">
        <Card.Header>
          <Card.Title>Book a slot</Card.Title>
          <Card.Meta>Greyed days are taken</Card.Meta>
        </Card.Header>
        <Card.Body>
          <Stack gap={4}>
            <Calendar
              aria-label="Firing day"
              value={day}
              onValueChange={setDay}
              min="2026-10-27"
              isDateDisabled={(date) => BOOKED.has(date)}
            />
            <TimeField label="Start" value={start} onValueChange={setStart} />
            <DateTimeField label="Unload by" value={unload} onValueChange={setUnload} />
            <CheckboxGroupField
              label="This load has"
              value={needs}
              onValueChange={setNeeds}
              options={[
                { value: 'wax', label: 'Waxed feet' },
                { value: 'cookies', label: 'Pieces on cookies' },
                { value: 'lustre', label: 'Lustre, needs a third firing' },
              ]}
            />
            <CheckboxField
              label="I'll be here to unload"
              checked={present}
              onCheckedChange={setPresent}
            />
            <Button
              onClick={() => {
                toast({
                  title: 'Slot booked',
                  description: `${day} from ${start}`,
                  tone: 'positive',
                })
              }}
            >
              Book {day}
            </Button>
          </Stack>
        </Card.Body>
      </Card>
      <Fieldset
        legend="Log a firing by hand"
        description="For when a controller drops off the network."
      >
        <Stack gap={4}>
          <Field label="Day">
            <DateInput value={logDay} onValueChange={setLogDay} />
          </Field>
          <Field label="Started at">
            <TimeInput value={logTime} onValueChange={setLogTime} />
          </Field>
          <Field label="Finished">
            <DateTimeInput value={logDone} onValueChange={setLogDone} />
          </Field>
          <Field label="Checked">
            <CheckboxGroup
              value={logChecks}
              onValueChange={setLogChecks}
              options={[
                { value: 'cones', label: 'Witness cones bent' },
                { value: 'elements', label: 'Elements glowing evenly' },
              ]}
            />
          </Field>
          <DateField label="Review the log by" value={reviewBy} onValueChange={setReviewBy} />
          <Text size="sm" tone="muted">
            Saved to this browser only.
          </Text>
        </Stack>
      </Fieldset>
    </Grid>
  )
}
