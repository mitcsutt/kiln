import {
  Card,
  ColorField,
  ColorInput,
  DateRangeField,
  Field,
  Grid,
  Heading,
  JsonField,
  JsonInput,
  RangeSlider,
  RangeSliderField,
  Stack,
  Text,
  ThemeScope,
} from '@mitcsutt/kiln-ui'
import { useState } from 'react'

import { POSTER_CONFIG, POSTER_INKS } from '#features/community/data/openStudio'

/** Two inks, a date and the doors: everything the print run needs. */
export function PosterDesk() {
  const [hours, setHours] = useState<[number, number]>([18, 22])
  const [copies, setCopies] = useState(120)
  return (
    <Grid columns={{ base: 1, lg: 2 }} gap={6}>
      <Stack gap={4}>
        <ColorField
          label="First ink"
          description="Riso drums the print shop has in"
          defaultValue="#ff6f61"
          swatches={POSTER_INKS}
          swatchesOnly
        />
        <Field label="Second ink">
          <ColorInput defaultValue="#2b59c3" swatches={POSTER_INKS} />
        </Field>
        <DateRangeField
          label="On the posters"
          startLabel="Posters up"
          endLabel="Open night"
          min="2026-10-27"
          defaultValue={{ start: '2026-11-20', end: '2026-12-05' }}
        />
        <Field label="Doors">
          <RangeSlider
            value={hours}
            onValueChange={(value) => {
              setHours(value)
            }}
            min={12}
            max={24}
            minStepsBetweenThumbs={1}
            thumbLabels={['Doors open', 'Last orders']}
            showValue
            formatOptions={{ style: 'unit', unit: 'hour' }}
          />
        </Field>
        <RangeSliderField
          label="Seconds sale prices"
          thumbLabels={['Cheapest', 'Dearest']}
          defaultValue={[5, 40]}
          min={0}
          max={80}
          step={5}
          showValue
          formatOptions={{ style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }}
        />
      </Stack>
      <Stack gap={4}>
        <ThemeScope theme="riso">
          <Card variant="outline" padding={6}>
            <Stack gap={2}>
              <Heading level={3} size="3xl">
                Open studio night
              </Heading>
              <Text>
                Saturday 5 December, {hours[0]}:00 to {hours[1]}:00. Wheels, raku and a seconds
                sale.
              </Text>
              <Text size="sm" tone="muted">
                Slipcast, Arch 4, Railway Yard
              </Text>
            </Stack>
          </Card>
        </ThemeScope>
        <JsonField
          label="Print shop order"
          description="Sent to the print shop as it is"
          formatOnBlur
          defaultValue={POSTER_CONFIG}
        />
        <Field label="Copies, as JSON" description="Edit the count to see it parsed">
          <JsonInput
            defaultValue={`{ "copies": ${copies} }`}
            maxRows={4}
            onValueChange={(_, { parsed }) => {
              const order = parsed as { copies?: unknown } | undefined
              if (typeof order?.copies === 'number') setCopies(order.copies)
            }}
          />
        </Field>
        <Text size="sm" tone="muted">
          {copies} copies at 4p each is £{((copies * 4) / 100).toFixed(2)}.
        </Text>
      </Stack>
    </Grid>
  )
}
