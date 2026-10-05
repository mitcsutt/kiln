import { PasswordField, Stack } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Stack gap={5}>
      <PasswordField label="Current password" autoComplete="current-password" />
      <PasswordField
        label="New password"
        autoComplete="new-password"
        description="At least 12 characters. A short sentence works well."
      />
    </Stack>
  )
}
