import { useContactsFilters } from '#features/contacts/pages/Contacts/hooks/useContactsFilters'

export function ContactsTableRow() {
  return <tr>{useContactsFilters().query}</tr>
}
