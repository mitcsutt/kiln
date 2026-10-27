import { delay } from '#utils/delay'

export type WorkshopLevel = 'beginner' | 'improver' | 'confident'

export interface Workshop {
  id: string
  title: string
  host: string
  date: string
  level: WorkshopLevel
  price: number
  spaces: number
  booked: number
  rating: number
  blurb: string
  art: 'bowl' | 'vase' | 'mug'
}

export const LEVEL_LABELS: Record<WorkshopLevel, string> = {
  beginner: 'First time on the wheel',
  improver: 'Can centre, wants to throw taller',
  confident: 'Throws, trims and glazes alone',
}

const WORKSHOPS: Workshop[] = [
  {
    id: 'w1',
    title: 'Throw a bowl in a night',
    host: 'Ines Okafor',
    date: '2026-11-06T18:30',
    level: 'beginner',
    price: 45,
    spaces: 8,
    booked: 6,
    rating: 4.8,
    blurb:
      'Centre, open and pull a bowl. You leave with clay on your jeans and a pot to collect after its firings.',
    art: 'bowl',
  },
  {
    id: 'w2',
    title: 'Tall forms and collaring',
    host: 'Theo Marsh',
    date: '2026-11-13T18:30',
    level: 'improver',
    price: 55,
    spaces: 6,
    booked: 6,
    rating: 4.6,
    blurb: 'Cylinders, then necks. Bring patience and a sponge on a stick.',
    art: 'vase',
  },
  {
    id: 'w3',
    title: 'Handles that stay on',
    host: 'Wren Adeyemi',
    date: '2026-11-20T18:30',
    level: 'confident',
    price: 40,
    spaces: 10,
    booked: 3,
    rating: 4.9,
    blurb: 'Pulled, extruded and slab handles, and the leather-hard window when they join.',
    art: 'mug',
  },
]

export const fetchWorkshops = (): Promise<Workshop[]> => delay(WORKSHOPS, 700)

export interface Review {
  id: string
  name: string
  quote: string
  workshop: string
}

export const REVIEWS: Review[] = [
  {
    id: 'r1',
    name: 'Priya',
    quote: 'I made a wonky bowl and I have never been prouder of anything.',
    workshop: 'Throw a bowl in a night',
  },
  {
    id: 'r2',
    name: 'Callum',
    quote: 'Theo talks about clay like it has opinions. It does.',
    workshop: 'Tall forms and collaring',
  },
  {
    id: 'r3',
    name: 'Mei',
    quote: 'Every handle I made before this is in a landfill.',
    workshop: 'Handles that stay on',
  },
  {
    id: 'r4',
    name: 'Josh',
    quote: 'Came for a date night, stayed for a membership.',
    workshop: 'Throw a bowl in a night',
  },
]

export const FAQS = [
  {
    id: 'apron',
    question: 'What should I wear?',
    answer:
      'Clothes that can get muddy, short nails, and hair tied back. Aprons are on the hooks by the sinks.',
  },
  {
    id: 'collect',
    question: 'When can I collect my pot?',
    answer:
      'About three weeks: it dries, gets a bisque firing, you glaze it at a drop-in, then it gets a glaze firing.',
  },
  {
    id: 'refund',
    question: 'Can I get a refund?',
    answer: 'Up to 48 hours before, or swap your place to any other workshop.',
  },
]

export interface BookingRequest {
  workshopId: string
  name: string
  email: string
}

/** Fails for a full workshop, the way a real booking would. */
export function bookWorkshop(request: BookingRequest, workshop: Workshop): Promise<string> {
  if (workshop.booked >= workshop.spaces) {
    return delay(undefined, 800).then(() => {
      throw new Error(`${workshop.title} is full. Join the waiting list instead.`)
    })
  }
  return delay(
    `SLP-${request.workshopId.toUpperCase()}-${String(workshop.booked + 1).padStart(2, '0')}`,
    800,
  )
}
