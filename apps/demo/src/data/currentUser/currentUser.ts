import { delay } from '#utils/delay'

export interface CurrentUser {
  name: string
  role: string
  studio: string
}

export interface Notice {
  id: string
  title: string
  at: string
  tone: 'info' | 'caution' | 'positive'
}

export const CURRENT_USER: CurrentUser = {
  name: 'Wren Adeyemi',
  role: 'Studio manager',
  studio: 'Slipcast Pottery Co-op',
}

const NOTICES: Notice[] = [
  { id: 'n1', title: 'Kiln 2 reached cone 6', at: '2026-10-27T08:40:00Z', tone: 'positive' },
  { id: 'n2', title: 'Clay order arrives Thursday', at: '2026-10-27T07:05:00Z', tone: 'info' },
  {
    id: 'n3',
    title: 'Three glaze invoices are overdue',
    at: '2026-10-26T16:20:00Z',
    tone: 'caution',
  },
]

/** The studio's unread notices, as the header's bell shows them. */
export function fetchNotices(): Promise<Notice[]> {
  return delay(NOTICES, 400)
}
