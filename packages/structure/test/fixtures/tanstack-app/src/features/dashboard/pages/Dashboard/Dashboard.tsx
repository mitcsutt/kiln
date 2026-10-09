import { CampaignsWidget } from '#features/campaigns/components/CampaignsWidget'
import { ContactAvatar } from '#features/contacts/components/ContactAvatar'

export function Dashboard() {
  return (
    <section>
      <CampaignsWidget owner={{ id: 'c1', name: 'Ada' }} />
      <ContactAvatar name="Ada" />
    </section>
  )
}
