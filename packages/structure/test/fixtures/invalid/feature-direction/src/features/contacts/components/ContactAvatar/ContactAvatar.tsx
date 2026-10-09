import { CampaignsWidget } from '#features/campaigns/components/CampaignsWidget'

export function ContactAvatar({ name }: { name: string }) {
  return <CampaignsWidget owner={{ id: '1', name }} />
}
