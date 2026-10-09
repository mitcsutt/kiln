import { ContactAvatar } from '#features/contacts/components/ContactAvatar'
import { contactQueries } from '#features/contacts/data/contacts'
import { useContactsFilters } from '#features/contacts/pages/Contacts/hooks/useContactsFilters'

import { ContactsTableRow } from './components/ContactsTableRow'

export function ContactsTable({ filters }: { filters: ReturnType<typeof useContactsFilters> }) {
  return (
    <table>
      <ContactsTableRow />
      <ContactAvatar name={filters.query} />
      {contactQueries.list().length}
    </table>
  )
}
