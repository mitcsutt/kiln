import { delay } from '#utils/delay'

export type Category =
  'Firing fees' | 'Memberships' | 'Workshops' | 'Clay and glaze' | 'Gallery sales'

export interface Transaction {
  id: string
  date: string
  description: string
  category: Category
  /** Pounds; negative is money out. */
  amount: number
  reconciled: boolean
}

export interface BudgetLine {
  id: string
  name: string
  budget: number
  spent: number
  children?: BudgetLine[]
}

export interface MonthTotal {
  month: string
  income: number
  costs: number
  target: number
}

export interface Invoice {
  id: string
  client: string
  amount: number
  due: string
  status: 'paid' | 'overdue' | 'draft'
}

export interface Ledger {
  balance: number
  balanceChange: number
  transactions: Transaction[]
  budget: BudgetLine[]
  months: MonthTotal[]
  incomeBySource: Record<string, number>
  invoices: Invoice[]
  balanceTrend: number[]
}

const LEDGER: Ledger = {
  balance: 18_432.6,
  balanceChange: 0.062,
  balanceTrend: [14_210, 14_980, 15_400, 15_120, 16_340, 17_020, 17_360, 18_432],
  transactions: [
    {
      id: 't01',
      date: '2026-10-26',
      description: 'Kiln 2, cone 6, Astrid Ferreira',
      category: 'Firing fees',
      amount: 24,
      reconciled: true,
    },
    {
      id: 't02',
      date: '2026-10-25',
      description: 'Studio plan, Maud Lindqvist',
      category: 'Memberships',
      amount: 120,
      reconciled: true,
    },
    {
      id: 't03',
      date: '2026-10-25',
      description: 'Potclays, 250 kg buff stoneware',
      category: 'Clay and glaze',
      amount: -412.5,
      reconciled: false,
    },
    {
      id: 't04',
      date: '2026-10-24',
      description: 'Saturday throwing class, 8 places',
      category: 'Workshops',
      amount: 520,
      reconciled: true,
    },
    {
      id: 't05',
      date: '2026-10-23',
      description: 'Gallery: celadon bowl set',
      category: 'Gallery sales',
      amount: 145,
      reconciled: true,
    },
    {
      id: 't06',
      date: '2026-10-22',
      description: 'Glaze materials, Scarva',
      category: 'Clay and glaze',
      amount: -188.2,
      reconciled: false,
    },
    {
      id: 't07',
      date: '2026-10-21',
      description: 'Shelf plan, Yuki Tanabe',
      category: 'Memberships',
      amount: 65,
      reconciled: true,
    },
    {
      id: 't08',
      date: '2026-10-20',
      description: 'Kiln 1, bisque, shared load',
      category: 'Firing fees',
      amount: 36,
      reconciled: true,
    },
  ],
  budget: [
    {
      id: 'materials',
      name: 'Materials',
      budget: 4800,
      spent: 3912,
      children: [
        { id: 'clay', name: 'Clay', budget: 2600, spent: 2210 },
        { id: 'glaze', name: 'Glaze materials', budget: 1400, spent: 1188 },
        { id: 'tools', name: 'Shared tools', budget: 800, spent: 514 },
      ],
    },
    {
      id: 'kilns',
      name: 'Kilns',
      budget: 6200,
      spent: 5104,
      children: [
        { id: 'power', name: 'Electricity', budget: 4200, spent: 3790 },
        { id: 'elements', name: 'Elements and repairs', budget: 1600, spent: 1050 },
        { id: 'shelves', name: 'Kiln shelves', budget: 400, spent: 264 },
      ],
    },
    { id: 'rent', name: 'Rent', budget: 14_400, spent: 12_000 },
  ],
  months: [
    { month: '2026-05-01', income: 6120, costs: 4980, target: 6000 },
    { month: '2026-06-01', income: 6480, costs: 5120, target: 6000 },
    { month: '2026-07-01', income: 5910, costs: 5340, target: 6200 },
    { month: '2026-08-01', income: 5470, costs: 4710, target: 6200 },
    { month: '2026-09-01', income: 7040, costs: 5260, target: 6400 },
    { month: '2026-10-01', income: 7380, costs: 5410, target: 6400 },
  ],
  incomeBySource: {
    memberships: 3120,
    firings: 1460,
    workshops: 1980,
    gallery: 820,
  },
  invoices: [
    {
      id: 'INV-2026-114',
      client: 'Northgate Primary School',
      amount: 640,
      due: '2026-10-10',
      status: 'overdue',
    },
    { id: 'INV-2026-117', client: 'Harbour Café', amount: 1280, due: '2026-10-30', status: 'paid' },
    {
      id: 'INV-2026-118',
      client: 'Ravi Chandrasekar',
      amount: 45,
      due: '2026-11-04',
      status: 'draft',
    },
  ],
}

/** The co-op's books for the current year, as the ledger page shows them. */
export function fetchLedger(): Promise<Ledger> {
  return delay(LEDGER, 750)
}

/** Total balance and its trend, for widgets outside the books. */
export function fetchBalance(): Promise<
  Pick<Ledger, 'balance' | 'balanceChange' | 'balanceTrend'>
> {
  return delay(
    {
      balance: LEDGER.balance,
      balanceChange: LEDGER.balanceChange,
      balanceTrend: LEDGER.balanceTrend,
    },
    500,
  )
}

export interface InvoiceDraft {
  client: string
  reference: string
  period: { start: string; end: string }
  lines: { description: string; quantity: number | null; price: number | null }[]
  notes: string
  schedule: { every: 'month' | 'term' | null; amount: number | null; start: string }
}

/** Saves an invoice. A client the books don't know comes back as a field error. */
export async function saveInvoice(
  draft: InvoiceDraft,
): Promise<{ ok: true; id: string } | { ok: false; message: string }> {
  await delay(null, 900)
  if (draft.client.trim().toLowerCase() === 'unknown client') {
    return { ok: false, message: "There's no client by that name in the books" }
  }
  return { ok: true, id: 'INV-2026-119' }
}
