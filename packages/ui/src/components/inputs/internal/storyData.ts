import type { SelectGroup, SelectOption } from '#components/inputs/Select'

/* Real content shared by the inputs stories. Not exported from the package. */

export const taskCategories: SelectGroup[] = [
  {
    label: 'Design',
    options: [
      { value: 'research', label: 'User research' },
      { value: 'visual', label: 'Visual design' },
      { value: 'prototyping', label: 'Prototyping' },
      { value: 'content', label: 'Content' },
    ],
  },
  {
    label: 'Engineering',
    options: [
      { value: 'frontend', label: 'Frontend' },
      { value: 'backend', label: 'Backend' },
      { value: 'infrastructure', label: 'Infrastructure' },
    ],
  },
  {
    label: 'Operations',
    options: [
      { value: 'support', label: 'Customer support' },
      { value: 'billing', label: 'Billing' },
      { value: 'legal', label: 'Legal review', disabled: true },
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
      { value: 'deu', label: 'Germany' },
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
