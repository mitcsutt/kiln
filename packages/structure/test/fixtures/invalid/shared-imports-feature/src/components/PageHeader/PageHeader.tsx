import { AppShell } from '#app/components/AppShell'
import { ContactAvatar } from '#features/contacts/components/ContactAvatar'

export function PageHeader({ title }: { title: string }) {
  return (
    <h1>
      <ContactAvatar name={title} />
      <AppShell />
    </h1>
  )
}
