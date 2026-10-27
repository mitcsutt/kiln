import { delay } from '#utils/delay'

export interface Proposal {
  id: string
  title: string
  by: string
}

export type ProposalColumn = 'ideas' | 'confirmed' | 'needsHelp'

export const PROPOSAL_COLUMNS: { id: ProposalColumn; label: string }[] = [
  { id: 'ideas', label: 'Ideas' },
  { id: 'needsHelp', label: 'Needs a volunteer' },
  { id: 'confirmed', label: 'Confirmed' },
]

export const PROPOSALS: Record<ProposalColumn, Proposal[]> = {
  ideas: [
    { id: 'p1', title: 'Raku firing in the yard', by: 'Theo' },
    { id: 'p2', title: 'Kids clay table', by: 'Ines' },
  ],
  needsHelp: [{ id: 'p3', title: 'Throwing demo on the big wheel', by: 'Wren' }],
  confirmed: [
    { id: 'p4', title: 'Seconds sale', by: 'Mei' },
    { id: 'p5', title: 'Glaze test tile wall', by: 'Callum' },
  ],
}

export interface SessionProposal {
  title: string
  kind: 'demo' | 'hands-on' | 'sale' | null
  minutes: number | null
  messy: boolean
  notes: string
}

export const saveProposal = (proposal: SessionProposal): Promise<SessionProposal> =>
  delay(proposal, 700)

export interface Volunteer {
  name: string
  shift: 'setup' | 'evening' | 'packdown' | null
  firstAid: boolean
}

export const signUpVolunteer = (volunteer: Volunteer): Promise<Volunteer> => delay(volunteer, 700)

export const POSTER_INKS = [
  { value: '#ff6f61', label: 'Fluorescent coral' },
  { value: '#2b59c3', label: 'Medium blue' },
  { value: '#ffb000', label: 'Sunflower' },
  { value: '#0f7b6c', label: 'Teal' },
]

export const POSTER_CONFIG = `{
  "title": "Open studio night",
  "date": "2026-12-05",
  "inks": ["#ff6f61", "#2b59c3"],
  "copies": 120
}`
