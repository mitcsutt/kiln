import { useDebouncedValue } from '#hooks/useDebouncedValue'

import { ContactsTable } from './components/ContactsTable'
import { useContactsFilters } from './hooks/useContactsFilters'

export function Contacts() {
  const filters = useDebouncedValue(useContactsFilters())
  return <ContactsTable filters={filters} />
}
