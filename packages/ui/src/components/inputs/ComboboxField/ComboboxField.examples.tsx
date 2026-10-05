import { ComboboxField } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <ComboboxField
      label="Destination"
      description="Any stop on the network"
      placeholder="Type a stop"
      options={['Harbour Square', 'Kelso Bay Pier', 'Marram Point', 'Old Quay', 'Ferry Lane'].map(
        (stop) => ({ value: stop, label: stop }),
      )}
      creatable
    />
  )
}
