import type { SelectGroup, SelectOption } from '#components/inputs/Select'

/* Real content shared by the inputs stories. Not exported from the package. */

export const expenseCategories: SelectGroup[] = [
  {
    label: 'Home',
    options: [
      { value: 'groceries', label: 'Groceries' },
      { value: 'rent', label: 'Rent' },
      { value: 'power', label: 'Electricity and gas' },
      { value: 'internet', label: 'Internet' },
    ],
  },
  {
    label: 'Getting around',
    options: [
      { value: 'fuel', label: 'Fuel' },
      { value: 'transport', label: 'Public transport' },
      { value: 'rego', label: 'Car registration' },
    ],
  },
  {
    label: 'Personal',
    options: [
      { value: 'eating-out', label: 'Eating out' },
      { value: 'gym', label: 'Gym membership' },
      { value: 'streaming', label: 'Streaming', disabled: true },
    ],
  },
]

export const periods: SelectOption[] = [
  { value: 'weekly', label: 'Weekly' },
  { value: 'fortnightly', label: 'Fortnightly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

export const countryGroups: SelectGroup[] = [
  {
    label: 'Americas',
    options: [
      { value: 'can', label: 'Canada' },
      { value: 'mex', label: 'Mexico' },
      { value: 'usa', label: 'United States' },
    ],
  },
  {
    label: 'Europe',
    options: [
      { value: 'fra', label: 'France' },
      { value: 'ger', label: 'Germany' },
      { value: 'esp', label: 'Spain' },
      { value: 'gbr', label: 'United Kingdom' },
    ],
  },
  {
    label: 'Asia-Pacific',
    options: [
      { value: 'aus', label: 'Australia' },
      { value: 'jpn', label: 'Japan' },
      { value: 'kor', label: 'South Korea' },
      { value: 'nzl', label: 'New Zealand' },
    ],
  },
]
