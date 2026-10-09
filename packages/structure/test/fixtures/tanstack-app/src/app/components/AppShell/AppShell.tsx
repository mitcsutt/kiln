import logo from '#assets/logo.svg'
import { PageHeader } from '#components/PageHeader'
import { ContactAvatar } from '#features/contacts/components/ContactAvatar'

import { AppSidebar } from './components/AppSidebar'

export function AppShell() {
  return (
    <main>
      <img src={logo} alt="" />
      <PageHeader title="CRM" />
      <AppSidebar />
      <ContactAvatar name="Ada" />
    </main>
  )
}
