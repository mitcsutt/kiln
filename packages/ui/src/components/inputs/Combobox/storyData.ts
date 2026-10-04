import type { ComboboxOption } from './Combobox'

/* Real content for the Combobox / ComboboxField stories. Not exported from the package. */

const country = (
  value: string,
  label: string,
  group: string,
  keywords?: readonly string[],
): ComboboxOption => (keywords ? { value, label, group, keywords } : { value, label, group })

/** Countries grouped by region; keywords catch other names for the same country. */
export const countries: readonly ComboboxOption[] = [
  country('alg', 'Algeria', 'Africa'),
  country('cpv', 'Cabo Verde', 'Africa', ['Cape Verde']),
  country('civ', "Côte d'Ivoire", 'Africa', ['Ivory Coast']),
  country('cod', 'DR Congo', 'Africa', ['Congo DR', 'Democratic Republic of the Congo']),
  country('egy', 'Egypt', 'Africa'),
  country('gha', 'Ghana', 'Africa'),
  country('mar', 'Morocco', 'Africa'),
  country('sen', 'Senegal', 'Africa'),
  country('rsa', 'South Africa', 'Africa'),
  country('tun', 'Tunisia', 'Africa'),
  country('arg', 'Argentina', 'Americas'),
  country('bra', 'Brazil', 'Americas', ['Brasil']),
  country('can', 'Canada', 'Americas'),
  country('col', 'Colombia', 'Americas'),
  country('cuw', 'Curaçao', 'Americas'),
  country('ecu', 'Ecuador', 'Americas'),
  country('hai', 'Haiti', 'Americas'),
  country('mex', 'Mexico', 'Americas'),
  country('pan', 'Panama', 'Americas'),
  country('par', 'Paraguay', 'Americas'),
  country('usa', 'United States', 'Americas', ['USA', 'US', 'America']),
  country('uru', 'Uruguay', 'Americas'),
  country('aus', 'Australia', 'Asia-Pacific'),
  country('irn', 'Iran', 'Asia-Pacific', ['IR Iran']),
  country('irq', 'Iraq', 'Asia-Pacific'),
  country('jpn', 'Japan', 'Asia-Pacific'),
  country('jor', 'Jordan', 'Asia-Pacific'),
  country('nzl', 'New Zealand', 'Asia-Pacific', ['Aotearoa']),
  country('qat', 'Qatar', 'Asia-Pacific'),
  country('ksa', 'Saudi Arabia', 'Asia-Pacific', ['KSA']),
  country('kor', 'South Korea', 'Asia-Pacific', ['Korea Republic', 'Korea']),
  country('uzb', 'Uzbekistan', 'Asia-Pacific'),
  country('aut', 'Austria', 'Europe'),
  country('bel', 'Belgium', 'Europe'),
  country('cro', 'Croatia', 'Europe', ['Hrvatska']),
  country('cze', 'Czechia', 'Europe', ['Czech Republic']),
  country('eng', 'England', 'Europe'),
  country('fra', 'France', 'Europe'),
  country('ger', 'Germany', 'Europe', ['Deutschland']),
  country('ita', 'Italy', 'Europe', ['Italia']),
  country('ned', 'Netherlands', 'Europe', ['Holland']),
  country('nor', 'Norway', 'Europe'),
  country('por', 'Portugal', 'Europe'),
  country('sco', 'Scotland', 'Europe'),
  country('esp', 'Spain', 'Europe', ['España']),
  country('sui', 'Switzerland', 'Europe', ['Suisse', 'Schweiz']),
  country('tur', 'Türkiye', 'Europe', ['Turkey']),
  country('ukr', 'Ukraine', 'Europe'),
]

/** Payees for the async story: the bills a typical month pays. */
export const payees: readonly ComboboxOption[] = [
  { value: 'corner-grocer', label: 'Corner Grocer', description: 'Groceries' },
  { value: 'fresh-market', label: 'Fresh Market', description: 'Groceries' },
  { value: 'bulk-foods', label: 'Bulk Foods Co-op', description: 'Groceries' },
  { value: 'hardware-barn', label: 'Hardware Barn', description: 'Home and garden' },
  { value: 'homewares', label: 'Homewares Depot', description: 'Home' },
  { value: 'stationers', label: 'The Stationers', description: 'Home office' },
  { value: 'city-power', label: 'City Power', description: 'Electricity and gas' },
  { value: 'gridline', label: 'Gridline Energy', description: 'Electricity and gas' },
  { value: 'northside-water', label: 'Northside Water', description: 'Water' },
  { value: 'fibreline', label: 'Fibreline', description: 'Internet and phone' },
  { value: 'skyband', label: 'Skyband Mobile', description: 'Internet and phone' },
  { value: 'wellcover', label: 'Wellcover', description: 'Health insurance' },
  {
    value: 'metro-transit',
    label: 'Metro Transit',
    description: 'Public transport',
    keywords: ['Travel card'],
  },
  { value: 'roadside-fuel', label: 'Roadside Fuel', description: 'Fuel' },
  { value: 'pharmacy', label: 'High Street Pharmacy', description: 'Health' },
  { value: 'streambox', label: 'Streambox', description: 'Streaming' },
]

/** Expense labels for the multiple/creatable and Tags stories. */
export const expenseLabels: readonly ComboboxOption[] = [
  { value: 'essentials', label: 'Essentials' },
  { value: 'school', label: 'School' },
  { value: 'holiday', label: 'Holiday' },
  { value: 'car', label: 'Car' },
  { value: 'gifts', label: 'Gifts' },
  { value: 'health', label: 'Health' },
  { value: 'subscriptions', label: 'Subscriptions' },
  { value: 'one-off', label: 'One-off' },
]
