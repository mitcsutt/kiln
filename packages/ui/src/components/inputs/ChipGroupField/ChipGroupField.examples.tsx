import { ChipGroupField } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <ChipGroupField
      label="Days you travel"
      description="We'll tailor alerts to these days"
      type="multiple"
      defaultValue={['mon', 'wed']}
      options={['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => ({
        value: day.toLowerCase(),
        label: day,
      }))}
    />
  )
}
