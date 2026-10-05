import { Stack, SwitchField } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={4}>
      <SwitchField
        label="Delay alerts"
        description="A notification when a saved route runs late."
        defaultChecked
      />
      <SwitchField label="Weekly summary" />
    </Stack>
  )
}
