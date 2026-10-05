import { filterOptions, foldText, rankOption } from './filterOptions'

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
