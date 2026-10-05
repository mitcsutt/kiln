import { PasswordInput } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <PasswordInput
      aria-label="Password"
      autoComplete="current-password"
      defaultValue="harbour-lights-42"
    />
  )
}
