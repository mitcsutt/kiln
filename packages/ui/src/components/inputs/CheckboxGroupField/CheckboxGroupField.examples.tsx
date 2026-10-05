import { CheckboxGroupField } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <CheckboxGroupField
      label="Alert me about"
      description="For your saved routes only"
      defaultValue={['delays']}
      options={[
        { value: 'delays', label: 'Delays over 5 minutes' },
        { value: 'platform', label: 'Berth changes' },
        { value: 'works', label: 'Planned works' },
      ]}
    />
  )
}
