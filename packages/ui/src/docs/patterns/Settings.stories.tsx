import type { Meta, StoryObj } from '@storybook/react-vite'
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
import { Avatar } from '#components/display/Avatar'
import { Alert } from '#components/feedback/Alert'
import { RadioGroupField } from '#components/inputs/RadioGroupField'
import { AppShell } from '#components/layout/AppShell'
import { Inline } from '#components/layout/Inline'
import { Heading } from '#components/typography/Heading'

/*
 * UI/Patterns/Settings: an account settings page with a section sidebar, built only from
 * library components (no CSS module, no className, no inline style). The person and the
 * product are invented.
 */

const meta = {
  title: 'UI/Patterns/Settings',
  parameters: { layout: 'fullscreen', controls: { disable: true } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const SECTIONS = ['Profile', 'Notifications', 'Billing', 'Security']

const TIME_ZONES = [
  { value: 'Europe/London', label: 'London (GMT+1)' },
  { value: 'Europe/Lisbon', label: 'Lisbon (GMT+1)' },
  { value: 'Asia/Tokyo', label: 'Tokyo (GMT+9)' },
  { value: 'America/Toronto', label: 'Toronto (GMT−4)' },
]

const DIGESTS = [
  { value: 'daily', label: 'Every morning', description: 'At 08:00 in your time zone' },
  { value: 'weekly', label: 'Monday mornings' },
  { value: 'never', label: 'Never' },
]

export const Settings: Story = {
  render: () => (
    <AppShell>
      <AppShell.Header>
        <Container width="wide">
          <Inline justify="between" gap={4}>
            <Text weight="strong">Plotline</Text>
            <Avatar name="Ines Duarte" size="sm" />
          </Inline>
        </Container>
      </AppShell.Header>
      <AppShell.Sidebar aria-label="Settings sections">
        <NavLinks label="Settings sections" orientation="vertical">
          {SECTIONS.map((name, i) => (
            <NavLinks.Item key={name} href={`#${name.toLowerCase()}`} active={i === 0}>
              {name}
            </NavLinks.Item>
          ))}
        </NavLinks>
      </AppShell.Sidebar>
      <AppShell.Main>
        <Section space={{ base: 6, md: 8 }}>
          <Container width="narrow">
            <Stack as="form" gap={8} aria-label="Profile settings">
              <Stack gap={2}>
                <Heading level={1} size="xl">
                  Profile
                </Heading>
                <Text tone="muted">How you appear to the four other people in your workspace.</Text>
              </Stack>

              <Fieldset variant="section" legend="About you">
                <TextField label="Display name" defaultValue="Ines Duarte" required />
                <TextField
                  label="Email"
                  type="email"
                  defaultValue="ines@example.com"
                  description="We send sign-in links here."
                  required
                />
                <TextareaField
                  label="Bio"
                  optional
                  defaultValue="Mapping cycle routes for the city council, two days a week."
                />
                <SelectField label="Time zone" options={TIME_ZONES} defaultValue="Europe/Lisbon" />
              </Fieldset>

              <Fieldset variant="section" legend="Email updates">
                <SwitchField
                  label="Comments on my maps"
                  description="As they happen"
                  defaultChecked
                />
                <SwitchField label="Someone shares a map with me" defaultChecked />
                <RadioGroupField
                  label="Activity digest"
                  name="digest"
                  options={DIGESTS}
                  defaultValue="weekly"
                />
              </Fieldset>

              <Inline gap={3} justify="end">
                <Button variant="ghost" tone="neutral" type="reset">
                  Discard changes
                </Button>
                <Button type="submit">Save profile</Button>
              </Inline>
            </Stack>

            <Stack gap={5}>
              <Divider spacing={8} />
              <SectionHeader title="Leave the workspace" level={2} size="lg" />
              <Alert tone="critical" variant="outline" title="Your 12 maps stay with the workspace">
                Ask an owner to move them first if you want to keep them.
              </Alert>
              <div>
                <Button tone="critical" variant="outline">
                  Leave workspace
                </Button>
              </div>
            </Stack>
          </Container>
        </Section>
      </AppShell.Main>
    </AppShell>
  ),
}

/**
 * Settings with linked sections in a side navigation and one form per section.
 */
export const Usage: Story = {
  tags: ['docs'],
  parameters: { layout: 'fullscreen' },
  render: function Usage() {
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
  },
}
