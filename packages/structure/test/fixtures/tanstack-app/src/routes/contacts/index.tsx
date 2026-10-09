import { contactQueries } from '#features/contacts/data/contacts'
import { Contacts } from '#features/contacts/pages/Contacts'

export const Route = { loader: contactQueries.list, component: Contacts }
