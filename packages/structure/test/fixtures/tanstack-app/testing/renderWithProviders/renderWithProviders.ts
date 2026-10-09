import { AppShell } from '#app/components/AppShell'
import { contactFixtures } from '#features/contacts/testing/contactFixtures'

export function renderWithProviders() {
  return { shell: AppShell, contacts: contactFixtures }
}
