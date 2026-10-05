import {
  ActionBar,
  Button,
  Container,
  Dialog,
  Divider,
  Fieldset,
  NavLinks,
  Section,
  SectionHeader,
  SelectField,
  Split,
  Stack,
  SwitchField,
  Text,
  TextareaField,
  TextField,
} from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Section space={7}>
      <Container width="content">
        <Split ratio="1/3" gap={7}>
          <NavLinks orientation="vertical" label="Settings">
            <NavLinks.Item href="#profile" active>
              Profile
            </NavLinks.Item>
            <NavLinks.Item href="#notifications">Notifications</NavLinks.Item>
            <NavLinks.Item href="#account">Account</NavLinks.Item>
          </NavLinks>
          <Stack gap={7}>
            <Stack gap={5} as="section" aria-labelledby="profile">
              <SectionHeader
                level={2}
                size="xl"
                titleId="profile"
                title="Profile"
                description="Shown to the people you share routes with."
              />
              <TextField label="Display name" defaultValue="Ines Varga" />
              <TextareaField
                label="About"
                description="A sentence or two. Plain text."
                defaultValue="Commutes by ferry, weekends on the coast path."
                showCount
                maxLength={160}
              />
              <SelectField
                label="Home station"
                defaultValue="harbour"
                options={[
                  { value: 'harbour', label: 'Harbour Square' },
                  { value: 'northpoint', label: 'Northpoint Library' },
                  { value: 'kelso', label: 'Kelso Bay Pier' },
                ]}
              />
            </Stack>
            <Divider />
            <Fieldset legend="Notifications" description="Sent to ines@example.com.">
              <Stack gap={4}>
                <SwitchField label="Weekly ride summary" defaultChecked />
                <SwitchField
                  label="Station alerts"
                  description="When your home station runs low."
                  defaultChecked
                />
                <SwitchField label="Product news" />
              </Stack>
            </Fieldset>
            <Divider />
            <Stack gap={4} as="section" aria-labelledby="account">
              <SectionHeader level={2} size="xl" titleId="account" title="Account" />
              <Text tone="muted">
                Deleting your account ends any active hire and removes your ride history.
              </Text>
              <Dialog>
                <Dialog.Trigger asChild>
                  <Button variant="outline" tone="critical">
                    Delete account
                  </Button>
                </Dialog.Trigger>
                <Dialog.Content
                  size="sm"
                  title="Delete your account?"
                  description="Your 214 rides and saved routes go with it. This can't be undone."
                >
                  <Dialog.Footer>
                    <Dialog.Close asChild>
                      <Button variant="ghost" tone="neutral">
                        Keep my account
                      </Button>
                    </Dialog.Close>
                    <Button tone="critical">Delete account</Button>
                  </Dialog.Footer>
                </Dialog.Content>
              </Dialog>
            </Stack>
            <ActionBar align="end">
              <Button variant="ghost" tone="neutral">
                Discard changes
              </Button>
              <Button>Save profile</Button>
            </ActionBar>
          </Stack>
        </Split>
      </Container>
    </Section>
  )
}
