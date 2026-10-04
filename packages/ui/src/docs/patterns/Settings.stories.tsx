import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from '#components/actions/Button'
import { Avatar } from '#components/display/Avatar'
import { Alert } from '#components/feedback/Alert'
import { Fieldset } from '#components/inputs/Fieldset'
import { RadioGroupField } from '#components/inputs/RadioGroupField'
import { SelectField } from '#components/inputs/SelectField'
import { SwitchField } from '#components/inputs/SwitchField'
import { TextareaField } from '#components/inputs/TextareaField'
import { TextField } from '#components/inputs/TextField'
import { AppShell } from '#components/layout/AppShell'
import { Container } from '#components/layout/Container'
import { Divider } from '#components/layout/Divider'
import { Inline } from '#components/layout/Inline'
import { Section } from '#components/layout/Section'
import { Stack } from '#components/layout/Stack'
import { NavLinks } from '#components/navigation/NavLinks'
import { Heading } from '#components/typography/Heading'
import { SectionHeader } from '#components/typography/SectionHeader'
import { Text } from '#components/typography/Text'

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
