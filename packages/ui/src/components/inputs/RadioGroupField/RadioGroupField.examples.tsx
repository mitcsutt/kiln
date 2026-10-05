import { RadioGroupField } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <RadioGroupField
      label="Seat preference"
      defaultValue="window"
      options={[
        { value: 'window', label: 'Window' },
        { value: 'aisle', label: 'Aisle' },
        { value: 'none', label: 'No preference', description: 'Faster boarding' },
      ]}
    />
  )
}
