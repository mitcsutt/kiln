import { ContactAvatar } from '#features/contacts/components/ContactAvatar'
import { contactQueries } from '#features/contacts/data/contacts'

export function ContactsList() {
  return (
    <ul>
      {contactQueries.list().map((contact) => (
        <ContactAvatar key={contact.id} name={contact.name} />
      ))}
    </ul>
  )
}
