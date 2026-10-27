import {
  Alert,
  Card,
  Field,
  OneTimeCodeField,
  OneTimeCodeInput,
  PasswordField,
  PasswordInput,
  Stack,
  Text,
} from '@mitcsutt/kiln-ui'
import { useState } from 'react'

const VOLUNTEER_CODE = '2412'

/** What volunteers need on the night. The mock code is 2412. */
export function DoorAccess() {
  const [unlocked, setUnlocked] = useState(false)
  const [tried, setTried] = useState(false)
  return (
    <Card variant="outline">
      <Card.Header>
        <Card.Title>Volunteer access</Card.Title>
        <Card.Meta>Enter the code from the volunteer email. Psst, it's 2412.</Card.Meta>
      </Card.Header>
      <Card.Body>
        <Stack gap={4}>
          <Field label="Volunteer code">
            <OneTimeCodeInput
              length={4}
              onComplete={(code) => {
                setTried(true)
                setUnlocked(code === VOLUNTEER_CODE)
              }}
            />
          </Field>
          {tried && !unlocked ? <Alert tone="critical" title="That code is not right" /> : null}
          {unlocked ? (
            <Stack gap={4}>
              <OneTimeCodeField
                label="Side door keypad"
                description="Change it after the night"
                length={6}
                defaultValue="580931"
              />
              <PasswordField
                label="Visitor wifi"
                description="On the chalkboard by the door too"
                defaultValue="wedge-and-wheel"
                autoComplete="current-password"
              />
              <Field label="Till PIN">
                <PasswordInput defaultValue="4471" autoComplete="current-password" />
              </Field>
            </Stack>
          ) : (
            <Text size="sm" tone="muted">
              The door code, wifi and till PIN appear here.
            </Text>
          )}
        </Stack>
      </Card.Body>
    </Card>
  )
}
