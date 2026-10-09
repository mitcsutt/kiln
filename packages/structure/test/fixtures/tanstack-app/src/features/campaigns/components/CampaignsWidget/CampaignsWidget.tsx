import { ContactAvatar } from '#features/contacts/components/ContactAvatar'
import type { Contact } from '#features/contacts/types/Contact'

export function CampaignsWidget({ owner }: { owner: Contact }) {
  return <ContactAvatar name={owner.name} />
}
