import { ChipGroup, Fieldset } from '@mitcsutt/kiln-ui'

const ALERTS = [
  { value: 'delays', label: 'Delays', count: 12 },
  { value: 'platform', label: 'Platform changes', count: 4 },
  { value: 'cancellations', label: 'Cancellations', count: 2 },
  { value: 'works', label: 'Planned works' },
  { value: 'strikes', label: 'Industrial action', disabled: true },
]

export function Multiple() {
  return (
    <Fieldset legend="Service alerts" description="Sent to your phone for saved routes">
      <ChipGroup type="multiple" name="alerts" options={ALERTS} defaultValue={['delays']} />
    </Fieldset>
  )
}

const ZONES = ['1', '2', '3', '4', '5'].map((zone) => ({ value: zone, label: `Zone ${zone}` }))

export function Single() {
  return <ChipGroup type="single" aria-label="Fare zone" options={ZONES} defaultValue="2" />
}

export function Invalid() {
  return (
    <Fieldset legend="Days you travel" error="Pick at least one day">
      <ChipGroup
        type="multiple"
        size="sm"
        options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
          value: day.toLowerCase(),
          label: day,
        }))}
      />
    </Fieldset>
  )
}
