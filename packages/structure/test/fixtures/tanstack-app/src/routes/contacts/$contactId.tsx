import { ContactAvatar } from '#features/contacts/components/ContactAvatar'
import { Contact } from '#features/contacts/pages/Contact'
import { contactSearchSchema } from '#features/contacts/schemas/contactSearchSchema'

export const Route = { component: Contact, pending: ContactAvatar, search: contactSearchSchema }
