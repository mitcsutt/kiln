import type { ComboboxOption } from './Combobox'

/* Real content for the Combobox / ComboboxField stories. Not exported from the package. */

const country = (
  value: string,
  label: string,
  group: string,
  keywords?: readonly string[],
): ComboboxOption => (keywords ? { value, label, group, keywords } : { value, label, group })

/** Countries grouped by region (ISO 3166 alpha-3 values); keywords catch other names for the same country. */
export const countries: readonly ComboboxOption[] = [
  country('dza', 'Algeria', 'Africa'),
  country('cpv', 'Cabo Verde', 'Africa', ['Cape Verde']),
  country('civ', "Côte d'Ivoire", 'Africa', ['Ivory Coast']),
  country('egy', 'Egypt', 'Africa'),
  country('eth', 'Ethiopia', 'Africa'),
  country('gha', 'Ghana', 'Africa'),
  country('ken', 'Kenya', 'Africa'),
  country('mar', 'Morocco', 'Africa'),
  country('nga', 'Nigeria', 'Africa'),
  country('zaf', 'South Africa', 'Africa'),
  country('arg', 'Argentina', 'Americas'),
  country('bra', 'Brazil', 'Americas', ['Brasil']),
  country('can', 'Canada', 'Americas'),
  country('chl', 'Chile', 'Americas'),
  country('col', 'Colombia', 'Americas'),
  country('cri', 'Costa Rica', 'Americas'),
  country('mex', 'Mexico', 'Americas', ['México']),
  country('per', 'Peru', 'Americas'),
  country('usa', 'United States', 'Americas', ['USA', 'US', 'America']),
  country('ury', 'Uruguay', 'Americas'),
  country('aus', 'Australia', 'Asia-Pacific'),
  country('ind', 'India', 'Asia-Pacific', ['Bharat']),
  country('idn', 'Indonesia', 'Asia-Pacific'),
  country('jpn', 'Japan', 'Asia-Pacific', ['Nippon']),
  country('mys', 'Malaysia', 'Asia-Pacific'),
  country('nzl', 'New Zealand', 'Asia-Pacific', ['Aotearoa']),
  country('phl', 'Philippines', 'Asia-Pacific'),
  country('sgp', 'Singapore', 'Asia-Pacific'),
  country('kor', 'South Korea', 'Asia-Pacific', ['Republic of Korea', 'Korea']),
  country('vnm', 'Vietnam', 'Asia-Pacific', ['Viet Nam']),
  country('aut', 'Austria', 'Europe', ['Österreich']),
  country('bel', 'Belgium', 'Europe'),
  country('hrv', 'Croatia', 'Europe', ['Hrvatska']),
  country('cze', 'Czechia', 'Europe', ['Czech Republic']),
  country('fra', 'France', 'Europe'),
  country('deu', 'Germany', 'Europe', ['Deutschland']),
  country('irl', 'Ireland', 'Europe', ['Éire']),
  country('ita', 'Italy', 'Europe', ['Italia']),
  country('nld', 'Netherlands', 'Europe', ['Holland']),
  country('nor', 'Norway', 'Europe', ['Norge']),
  country('prt', 'Portugal', 'Europe'),
  country('esp', 'Spain', 'Europe', ['España']),
  country('che', 'Switzerland', 'Europe', ['Suisse', 'Schweiz']),
  country('tur', 'Türkiye', 'Europe', ['Turkey']),
  country('ukr', 'Ukraine', 'Europe'),
  country('gbr', 'United Kingdom', 'Europe', ['UK', 'Britain']),
]

/** Clients for the async story: the companies a small studio bills. */
export const clients: readonly ComboboxOption[] = [
  { value: 'northwind', label: 'Northwind Studio', description: 'Design agency' },
  { value: 'brightline', label: 'Brightline Labs', description: 'Developer tools' },
  { value: 'orchard', label: 'Orchard & Co', description: 'Retail' },
  { value: 'harbourview', label: 'Harbourview Clinic', description: 'Healthcare' },
  { value: 'lumen', label: 'Lumen Analytics', description: 'Data and analytics' },
  { value: 'paperkite', label: 'Paperkite Press', description: 'Publishing' },
  { value: 'tidewater', label: 'Tidewater Logistics', description: 'Freight and shipping' },
  { value: 'greenfield', label: 'Greenfield Energy', description: 'Renewable energy' },
  { value: 'copperleaf', label: 'Copperleaf Legal', description: 'Law firm' },
  { value: 'fernhill', label: 'Fernhill School', description: 'Education' },
  { value: 'quill', label: 'Quill & Ink', description: 'Stationery' },
  { value: 'summit', label: 'Summit Outdoor', description: 'Retail' },
  {
    value: 'atlas-cloud',
    label: 'Atlas Cloud Services',
    description: 'Hosting',
    keywords: ['ACS'],
  },
  { value: 'bluebird', label: 'Bluebird Bakery', description: 'Hospitality' },
  { value: 'meridian', label: 'Meridian Architects', description: 'Architecture' },
  { value: 'kitestring', label: 'Kitestring Games', description: 'Game studio' },
]

/** Project labels for the multiple/creatable and Tags stories. */
export const projectLabels: readonly ComboboxOption[] = [
  { value: 'design', label: 'Design' },
  { value: 'frontend', label: 'Frontend' },
  { value: 'backend', label: 'Backend' },
  { value: 'research', label: 'Research' },
  { value: 'urgent', label: 'Urgent' },
  { value: 'bug', label: 'Bug' },
  { value: 'docs', label: 'Docs' },
  { value: 'blocked', label: 'Blocked' },
]
