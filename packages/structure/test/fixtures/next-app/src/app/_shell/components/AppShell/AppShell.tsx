import { PageHeader } from '#components/PageHeader'
import { ContactAvatar } from '#features/contacts/components/ContactAvatar'

import { AppNav } from './components/AppNav'

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <main>
      <PageHeader title="CRM" />
      <AppNav />
      <ContactAvatar name="Ada" />
      {children}
    </main>
  )
}
