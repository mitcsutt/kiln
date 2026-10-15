import { humanise, numericKeys, pivotRows, summarise, tableOf, type ChartRow } from '#core/data'
import { valueFormatter } from '#core/format'

const REGIONS = [
  'Harbour',
  'Quay',
  'Northgate',
  'Riverside',
  'Old Town',
  'Docklands',
  'Hillcrest',
  'Westfield',
  'Marina',
  'Elm Park',
]

/** Long rows for two months, region `i` selling `100 - i * 10` a month. */
const long: ChartRow[] = ['2026-03', '2026-04'].flatMap((month) =>
  REGIONS.map((region, i) => ({ month, region, sales: 100 - i * 10 })),
)

describe('pivotRows', () => {
  it('turns long rows wide, one key per series', () => {
    const { rows, keys } = pivotRows(long.slice(0, 3), 'month', { by: 'region', value: 'sales' })
    expect(keys).toEqual(['Harbour', 'Quay', 'Northgate'])
    expect(rows).toEqual([{ month: '2026-03', Harbour: 100, Quay: 90, Northgate: 80 }])
  })

  it('keeps the top 7 and groups the rest as Other when there are more than 8', () => {
    const { rows, keys, otherKey } = pivotRows(long, 'month', { by: 'region', value: 'sales' })
    expect(keys).toEqual([...REGIONS.slice(0, 7), 'Other'])
    expect(otherKey).toBe('Other')
    // Westfield (30) + Marina (20) + Elm Park (10)
    expect(rows[0]?.Other).toBe(60)
    expect(rows).toHaveLength(2)
  })

  it('keeps 8 series as they are, and every series with limit false', () => {
    const eight = long.filter((row) => REGIONS.slice(0, 8).includes(row.region as string))
    expect(pivotRows(eight, 'month', { by: 'region', value: 'sales' }).keys).toHaveLength(8)
    const all = pivotRows(long, 'month', { by: 'region', value: 'sales', limit: false })
    expect(all.keys).toEqual(REGIONS)
    expect(all.otherKey).toBeUndefined()
  })

  it('takes a configured limit and name for the group', () => {
    const { keys } = pivotRows(long, 'month', {
      by: 'region',
      value: 'sales',
      limit: 3,
      other: 'Everywhere else',
    })
    expect(keys).toEqual(['Harbour', 'Quay', 'Northgate', 'Everywhere else'])
  })

  it('adds up repeated rows and groups dates by their time', () => {
    const { rows } = pivotRows(
      [
        { day: new Date(Date.UTC(2026, 2, 1)), team: 'Design', hours: 3 },
        { day: new Date(Date.UTC(2026, 2, 1)), team: 'Design', hours: 2 },
      ],
      'day',
      { by: 'team', value: 'hours' },
    )
    expect(rows).toHaveLength(1)
    expect(rows[0]?.Design).toBe(5)
  })
})

describe('series helpers', () => {
  it('finds numeric keys in first-seen order, leaving out x', () => {
    expect(
      numericKeys(
        [
          { month: 'Mar', revenue: 1, note: 'x' },
          { month: 'Apr', costs: 2, revenue: 3 },
        ],
        'month',
      ),
    ).toEqual(['revenue', 'costs'])
  })

  it('makes keys readable and leaves names alone', () => {
    expect(humanise('unitsSold')).toBe('Units sold')
    expect(humanise('units_sold')).toBe('Units sold')
    expect(humanise('North')).toBe('North')
    expect(humanise('Harbour Street')).toBe('Harbour Street')
  })
})

describe('summary and table', () => {
  const rows = [
    { month: 'Jan', revenue: 1200, target: 1500 },
    { month: 'Feb', revenue: 1800, target: 1500 },
    { month: 'Mar', revenue: null, target: 1500 },
  ]
  const format = valueFormatter('number', { locale: 'en-AU' })
  const series = [
    { key: 'revenue', label: 'Revenue', format },
    { key: 'target', label: 'Target', format },
  ]
  const formatX = (value: unknown) => String(value)

  it('summarises each series from the data', () => {
    expect(summarise(rows, 'month', formatX, series)).toBe(
      '2 series over 3 points, from Jan to Mar. Revenue ranges from 1,200 (Jan) to 1,800 (Feb). Target is 1,500 throughout.',
    )
    expect(summarise([], 'month', formatX, series)).toBe('No data.')
  })

  it('writes a column per series and a row per point, missing values as a dash', () => {
    expect(tableOf(rows, 'month', 'Month', formatX, series)).toEqual({
      columns: ['Month', 'Revenue', 'Target'],
      rows: [
        ['Jan', '1,200', '1,500'],
        ['Feb', '1,800', '1,500'],
        ['Mar', '–', '1,500'],
      ],
    })
  })
})
