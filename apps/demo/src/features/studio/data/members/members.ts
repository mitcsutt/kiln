import { delay } from '#utils/delay'

export type MemberRole = 'potter' | 'teacher' | 'technician' | 'volunteer'
export type MemberPlan = 'drop-in' | 'shelf' | 'studio'

export interface Member {
  id: string
  name: string
  email: string
  role: MemberRole
  plan: MemberPlan
  keyholder: boolean
  joined: string
  shelf: string | null
  skills: string[]
  firingsThisMonth: number
  lastVisit: string
}

export const ROLE_LABELS: Record<MemberRole, string> = {
  potter: 'Potter',
  teacher: 'Teacher',
  technician: 'Kiln technician',
  volunteer: 'Volunteer',
}

export const PLAN_LABELS: Record<MemberPlan, string> = {
  'drop-in': 'Drop-in',
  shelf: 'Shelf',
  studio: 'Studio',
}

const MEMBERS: Member[] = [
  {
    id: 'm01',
    name: 'Wren Adeyemi',
    email: 'wren@slipcast.example',
    role: 'technician',
    plan: 'studio',
    keyholder: true,
    joined: '2021-03-14',
    shelf: 'A1',
    skills: ['Glaze chemistry', 'Kiln repair'],
    firingsThisMonth: 9,
    lastVisit: '2026-10-27T08:10:00Z',
  },
  {
    id: 'm02',
    name: 'Tomasz Bielski',
    email: 'tomasz@slipcast.example',
    role: 'teacher',
    plan: 'studio',
    keyholder: true,
    joined: '2022-01-09',
    shelf: 'A4',
    skills: ['Wheel throwing', 'Trimming'],
    firingsThisMonth: 6,
    lastVisit: '2026-10-26T18:30:00Z',
  },
  {
    id: 'm03',
    name: 'Ines Okonkwo-Hart',
    email: 'ines@slipcast.example',
    role: 'potter',
    plan: 'shelf',
    keyholder: false,
    joined: '2024-06-02',
    shelf: 'B2',
    skills: ['Hand building'],
    firingsThisMonth: 3,
    lastVisit: '2026-10-25T11:00:00Z',
  },
  {
    id: 'm04',
    name: 'Ravi Chandrasekar',
    email: 'ravi@slipcast.example',
    role: 'potter',
    plan: 'drop-in',
    keyholder: false,
    joined: '2026-02-18',
    shelf: null,
    skills: ['Wheel throwing'],
    firingsThisMonth: 1,
    lastVisit: '2026-10-19T14:45:00Z',
  },
  {
    id: 'm05',
    name: 'Maud Lindqvist',
    email: 'maud@slipcast.example',
    role: 'teacher',
    plan: 'studio',
    keyholder: true,
    joined: '2020-09-30',
    shelf: 'A2',
    skills: ['Raku', 'Slip decoration', 'Hand building'],
    firingsThisMonth: 7,
    lastVisit: '2026-10-27T07:55:00Z',
  },
  {
    id: 'm06',
    name: 'Kofi Mensah',
    email: 'kofi@slipcast.example',
    role: 'volunteer',
    plan: 'shelf',
    keyholder: false,
    joined: '2025-04-11',
    shelf: 'C1',
    skills: ['Clay reclaim'],
    firingsThisMonth: 2,
    lastVisit: '2026-10-24T10:20:00Z',
  },
  {
    id: 'm07',
    name: 'Astrid Ferreira',
    email: 'astrid@slipcast.example',
    role: 'potter',
    plan: 'studio',
    keyholder: true,
    joined: '2023-11-05',
    shelf: 'A3',
    skills: ['Porcelain', 'Wheel throwing'],
    firingsThisMonth: 5,
    lastVisit: '2026-10-26T20:05:00Z',
  },
  {
    id: 'm08',
    name: 'Hamish Doyle',
    email: 'hamish@slipcast.example',
    role: 'potter',
    plan: 'drop-in',
    keyholder: false,
    joined: '2026-08-21',
    shelf: null,
    skills: [],
    firingsThisMonth: 0,
    lastVisit: '2026-10-12T16:00:00Z',
  },
  {
    id: 'm09',
    name: 'Yuki Tanabe',
    email: 'yuki@slipcast.example',
    role: 'potter',
    plan: 'shelf',
    keyholder: false,
    joined: '2025-01-27',
    shelf: 'B4',
    skills: ['Glaze chemistry', 'Porcelain'],
    firingsThisMonth: 4,
    lastVisit: '2026-10-26T09:40:00Z',
  },
  {
    id: 'm10',
    name: 'Leonie Achterberg',
    email: 'leonie@slipcast.example',
    role: 'volunteer',
    plan: 'drop-in',
    keyholder: false,
    joined: '2026-05-03',
    shelf: null,
    skills: ['Front desk'],
    firingsThisMonth: 0,
    lastVisit: '2026-10-20T12:15:00Z',
  },
]

/** Every member of the co-op, as the members page lists them. */
export function fetchMembers(): Promise<Member[]> {
  return delay(MEMBERS, 700)
}

export interface Invitation {
  name: string
  email: string
  role: MemberRole | null
  keyholder: boolean
}

/** Sends an invitation. Fails, like a server would, for an address that already belongs to a member. */
export async function inviteMember(
  invitation: Invitation,
): Promise<{ ok: true } | { ok: false; field: 'email'; message: string }> {
  await delay(null, 800)
  if (MEMBERS.some((member) => member.email === invitation.email.trim().toLowerCase())) {
    return { ok: false, field: 'email', message: 'That address already belongs to a member' }
  }
  return { ok: true }
}

export interface StudioSettings {
  studioName: string
  contactEmail: string
  brandColour: string
  openFrom: string
  openTo: string
  closedDays: string[]
  defaultCone: number
  bisqueRange: [number, number]
  coolingHours: number
  shelfFee: number | null
  units: 'celsius' | 'fahrenheit'
  newsletter: boolean
  publicGallery: boolean
  nextOpenStudio: string
  studioId: string
  clayBody: 'stoneware' | 'porcelain' | 'earthenware' | null
  featuredGlaze: string | null
  stockedGlazes: string[]
  webhook: string
}

export const STUDIO_SETTINGS: StudioSettings = {
  studioName: 'Slipcast Pottery Co-op',
  contactEmail: 'hello@slipcast.example',
  brandColour: '#b4532a',
  openFrom: '08:00',
  openTo: '21:30',
  closedDays: ['mon'],
  defaultCone: 6,
  bisqueRange: [940, 1000],
  coolingHours: 14,
  shelfFee: 18,
  units: 'celsius',
  newsletter: true,
  publicGallery: true,
  nextOpenStudio: '2026-11-14T10:00',
  studioId: 'studio-0417',
  clayBody: 'stoneware',
  featuredGlaze: 'celadon',
  stockedGlazes: ['celadon', 'tenmoku', 'satin-white'],
  webhook: JSON.stringify(
    { url: 'https://hooks.slipcast.example/firings', events: ['firing.done', 'kiln.fault'] },
    null,
    2,
  ),
}

/** The studio's settings, as the settings page loads them. */
export function fetchStudioSettings(): Promise<StudioSettings> {
  return delay(STUDIO_SETTINGS, 500)
}

/** Saves settings. Aborted when a newer save starts, as autosave expects. */
export function saveStudioSettings(_settings: StudioSettings, { signal }: { signal: AbortSignal }) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, 700)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new Error('Superseded by a newer save'))
    })
  })
}

export interface Glaze {
  value: string
  label: string
  description: string
}

export const GLAZES: Glaze[] = [
  { value: 'celadon', label: 'Celadon', description: 'Cone 6, translucent green' },
  { value: 'tenmoku', label: 'Tenmoku', description: 'Cone 6, iron black to rust' },
  { value: 'shino', label: 'Shino', description: 'Cone 10, carbon trap' },
  { value: 'chun', label: 'Chun blue', description: 'Cone 6, opalescent' },
  { value: 'satin-white', label: 'Satin white', description: 'Cone 6, liner safe' },
  { value: 'oribe', label: 'Oribe', description: 'Cone 6, copper green' },
]

/** Searches the glaze shelf, as a combobox's async loader would. */
export function searchGlazes(query: string): Promise<Glaze[]> {
  const q = query.trim().toLowerCase()
  return delay(
    GLAZES.filter((glaze) => glaze.label.toLowerCase().includes(q)),
    350,
  )
}
