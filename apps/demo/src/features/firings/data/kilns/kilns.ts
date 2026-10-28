import { delay } from '#utils/delay'

export type KilnStatus = 'firing' | 'cooling' | 'idle' | 'fault'

export interface Kiln {
  id: string
  name: string
  status: KilnStatus
  /** °C, now. */
  temperature: number
  setpoint: number
  maxTemperature: number
  cone: number | null
  /** 0 to 100. */
  progress: number
  startedAt: string | null
  /** The last twelve readings, oldest first. */
  recent: number[]
}

export interface CurvePoint {
  time: string
  actual: number | null
  planned: number
}

export interface UsageCell {
  day: string
  slot: string
  firings: number
}

export interface Piece {
  id: string
  name: string
  maker: string
  stage: 'bisque' | 'glaze'
}

export interface KilnRoom {
  kilns: Kiln[]
  curve: CurvePoint[]
  usage: UsageCell[]
  log: string
}

const ROOM_TEMPERATURE = 20

const KILNS: Kiln[] = [
  {
    id: 'k1',
    name: 'Kiln 1 · Big Bertha',
    status: 'cooling',
    temperature: 412,
    setpoint: 0,
    maxTemperature: 1300,
    cone: 6,
    progress: 84,
    startedAt: '2026-10-26T19:00:00Z',
    recent: [1210, 1150, 1060, 960, 880, 800, 720, 650, 580, 520, 460, 412],
  },
  {
    id: 'k2',
    name: 'Kiln 2 · Test kiln',
    status: 'firing',
    temperature: 1048,
    setpoint: 1222,
    maxTemperature: 1300,
    cone: 6,
    progress: 61,
    startedAt: '2026-10-27T02:30:00Z',
    recent: [610, 660, 712, 760, 802, 851, 893, 934, 968, 1002, 1027, 1048],
  },
  {
    id: 'k3',
    name: 'Kiln 3 · Raku',
    status: 'idle',
    temperature: 19,
    setpoint: 0,
    maxTemperature: 1050,
    cone: null,
    progress: 0,
    startedAt: null,
    recent: [19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19, 19],
  },
]

const HOURS = [
  '02:30',
  '03:30',
  '04:30',
  '05:30',
  '06:30',
  '07:30',
  '08:30',
  '09:30',
  '10:30',
  '11:30',
]
const PLANNED = [20, 180, 360, 540, 700, 860, 980, 1100, 1180, 1222]
const ACTUAL = [20, 176, 352, 548, 712, 851, 1002, 1048, null, null]

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']
const SLOTS = ['Night', 'Morning', 'Afternoon', 'Evening']
const USAGE = [0, 2, 1, 0, 1, 3, 2, 1, 2, 3, 3, 2, 1, 2, 2, 1, 2, 3, 1, 0, 3, 3, 2, 1, 1, 1, 0, 0]

const LOG = JSON.stringify(
  {
    kiln: 'k2',
    segment: 3,
    rampRate: 108,
    target: 1222,
    hold: 10,
    thermocouple: { type: 'K', reading: 1048, offset: -2 },
    alarms: [],
  },
  null,
  2,
)

/** The kiln room as the controllers last reported it. */
export function fetchKilnRoom(): Promise<KilnRoom> {
  return delay(
    {
      kilns: KILNS,
      curve: HOURS.map((time, index) => ({
        time: `2026-10-27T${time}:00Z`,
        planned: PLANNED[index] ?? 0,
        actual: ACTUAL[index] ?? null,
      })),
      usage: DAYS.flatMap((day, d) =>
        SLOTS.map((slot, s) => ({ day, slot, firings: USAGE[d * SLOTS.length + s] ?? 0 })),
      ),
      log: LOG,
    },
    800,
  )
}

export interface Reading {
  temperature: number
  status: KilnStatus
}

/**
 * Live readings: calls back every two seconds with each kiln's temperature nudged the way it's
 * heading, as a controller's websocket would. A firing kiln that reaches its setpoint moves to
 * cooling, and a cooling kiln that reaches room temperature goes idle, so status changes only a
 * few minutes apart. Returns the unsubscribe.
 */
export function subscribeToReadings(onReading: (readings: Record<string, Reading>) => void) {
  const current: Record<string, Reading> = Object.fromEntries(
    KILNS.map((kiln) => [kiln.id, { temperature: kiln.temperature, status: kiln.status }]),
  )
  const timer = setInterval(() => {
    for (const kiln of KILNS) {
      const reading = current[kiln.id]
      if (!reading) continue
      if (reading.status === 'firing') {
        reading.temperature = Math.min(reading.temperature + 3, kiln.setpoint)
        if (reading.temperature >= kiln.setpoint) reading.status = 'cooling'
      } else if (reading.status === 'cooling') {
        reading.temperature = Math.max(reading.temperature - 4, ROOM_TEMPERATURE)
        if (reading.temperature <= ROOM_TEMPERATURE) reading.status = 'idle'
      }
    }
    onReading(Object.fromEntries(Object.entries(current).map(([id, r]) => [id, { ...r }])))
  }, 2000)
  return () => {
    clearInterval(timer)
  }
}

/** The kiln summary other pages show. */
export function fetchKilnSummary(): Promise<
  Pick<Kiln, 'id' | 'name' | 'status' | 'temperature' | 'progress'>[]
> {
  return delay(
    KILNS.map(({ id, name, status, temperature, progress }) => ({
      id,
      name,
      status,
      temperature,
      progress,
    })),
    450,
  )
}

export const PIECES: Piece[] = [
  { id: 'p1', name: 'Celadon bowl set', maker: 'Astrid Ferreira', stage: 'glaze' },
  { id: 'p2', name: 'Tall jug', maker: 'Tomasz Bielski', stage: 'bisque' },
  { id: 'p3', name: 'Porcelain cups, six', maker: 'Yuki Tanabe', stage: 'glaze' },
  { id: 'p4', name: 'Planters for the café', maker: 'Kofi Mensah', stage: 'bisque' },
  { id: 'p5', name: 'Raku tiles', maker: 'Maud Lindqvist', stage: 'glaze' },
  { id: 'p6', name: 'Test tiles, tenmoku', maker: 'Wren Adeyemi', stage: 'glaze' },
]
