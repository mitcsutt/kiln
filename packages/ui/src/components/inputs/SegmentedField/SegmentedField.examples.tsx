import { SegmentedField } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <SegmentedField
      label="Journey"
      defaultValue="return"
      options={[
        { value: 'single', label: 'Single' },
        { value: 'return', label: 'Return' },
        { value: 'open', label: 'Open return' },
      ]}
    />
  )
}
