import { contactQueries } from '#features/contacts/data/contacts'
import { Contact } from '#features/contacts/pages/Contact'

export async function generateStaticParams() {
  return contactQueries.list().map((contact) => ({ contactId: contact.id }))
}

export default function ContactPage() {
  return <Contact />
}
