import { ContactsTable } from '#features/contacts/pages/Contacts/components/ContactsTable'

export function ContactHeader() {
  return <ContactsTable filters={{ query: '' }} />
}
