import type { Contact } from '#features/contacts/types/Contact'

export function ContactAvatar({ name }: Pick<Contact, 'name'>) {
  return <span>{name}</span>
}
