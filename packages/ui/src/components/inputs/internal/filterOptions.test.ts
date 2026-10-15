import { filterOptions, foldText, groupOptions, matchRange, rankOption } from './filterOptions'

const countries = [
  { label: 'Australia' },
  { label: 'Austria' },
  { label: 'United States', keywords: ['USA', 'America'] },
  { label: 'Curaçao' },
  { label: "Côte d'Ivoire", keywords: ['Ivory Coast'] },
  { label: 'South Africa' },
  { label: 'Saudi Arabia', description: 'Western Asia' },
]

const labels = (query: string) => filterOptions(countries, query).map((option) => option.label)

describe('foldText', () => {
  it('lower-cases, strips diacritics and collapses whitespace', () => {
    expect(foldText('  Côte   d’Ivoire ')).toBe('cote d’ivoire')
    expect(foldText('CURAÇAO')).toBe('curacao')
  })
})

describe('filterOptions', () => {
  it('returns every option in order for an empty or blank query', () => {
    expect(labels('')).toEqual(countries.map((country) => country.label))
    expect(labels('   ')).toHaveLength(countries.length)
  })

  it('matches case-insensitively and without diacritics', () => {
    expect(labels('curacao')).toEqual(['Curaçao'])
    expect(labels('COTE')).toEqual(["Côte d'Ivoire"])
  })

  it('ranks exact (label or keyword) before prefix before substring', () => {
    // "usa": exact keyword for United States; nothing else contains it.
    expect(labels('usa')).toEqual(['United States'])
    // "a": every option contains an "a"; word prefixes (Australia, Austria, America,
    // Africa, Arabia) beat plain substrings, and ties keep the original order.
    expect(labels('a')).toEqual([
      'Australia',
      'Austria',
      'United States',
      'South Africa',
      'Saudi Arabia',
      'Curaçao',
      "Côte d'Ivoire",
    ])
    expect(labels('austr')).toEqual(['Australia', 'Austria'])
  })

  it('matches word prefixes and keywords as prefixes', () => {
    expect(labels('afr')).toEqual(['South Africa'])
    expect(labels('ivory')).toEqual(["Côte d'Ivoire"])
  })

  it('searches the description as a substring only', () => {
    expect(labels('asia')).toEqual(['Saudi Arabia'])
  })

  it('is stable within a rank', () => {
    const same = [{ label: 'Spain' }, { label: 'Spain' }, { label: 'Spain' }]
    expect(filterOptions(same, 'spain')).toEqual(same)
  })

  it('ranks with rankOption (3 = no match)', () => {
    expect(rankOption({ label: 'Spain' }, 'spain')).toBe(0)
    expect(rankOption({ label: 'Spain' }, 'sp')).toBe(1)
    expect(rankOption({ label: 'Spain' }, 'ain')).toBe(2)
    expect(rankOption({ label: 'Spain' }, 'xyz')).toBe(3)
  })
})

describe('groupOptions', () => {
  it('groups in order of each group’s first option, ungrouped options in their own section', () => {
    const sections = groupOptions([
      { label: 'Invoices', group: 'Pages' },
      { label: 'Log out' },
      { label: 'Toggle dark mode', group: 'Settings' },
      { label: 'Clients', group: 'Pages' },
    ])
    expect(sections.map((section) => [section.label, section.options.map((o) => o.label)])).toEqual(
      [
        ['Pages', ['Invoices', 'Clients']],
        [undefined, ['Log out']],
        ['Settings', ['Toggle dark mode']],
      ],
    )
    expect(new Set(sections.map((section) => section.key)).size).toBe(3)
  })
})

describe('matchRange', () => {
  const slice = (label: string, query: string) => {
    const range = matchRange(label, query)
    return range ? label.slice(range[0], range[1]) : null
  }

  it('finds the label prefix first, then a word start, then anywhere', () => {
    expect(matchRange('Settings', 'set')).toEqual([0, 3])
    expect(slice('Reset settings', 'set')).toBe('set')
    expect(matchRange('Reset settings', 'set')).toEqual([6, 9])
    expect(slice('Unassigned', 'sign')).toBe('sign')
  })

  it('folds case, accents and whitespace but returns the original characters', () => {
    expect(slice('Côte d’Ivoire', 'cote')).toBe('Côte')
    expect(slice('Curaçao', 'CURAC')).toBe('Curaç')
    expect(slice('Open   the  ledger', 'the ledger')).toBe('the  ledger')
    // A precomposed and a decomposed accent both stay whole inside the mark.
    expect(slice('Cafe\u0301 Rouge', 'cafe')).toBe('Cafe\u0301')
  })

  it('returns null for a blank query or a match outside the label', () => {
    expect(matchRange('United States', '  ')).toBeNull()
    expect(matchRange('United States', 'usa')).toBeNull()
  })
})
