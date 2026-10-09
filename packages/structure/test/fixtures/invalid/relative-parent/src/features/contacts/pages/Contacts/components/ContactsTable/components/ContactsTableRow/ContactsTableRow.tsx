import { useContactsFilters } from '../../../../hooks/useContactsFilters'

export function ContactsTableRow() {
  return <tr>{useContactsFilters().query}</tr>
}
