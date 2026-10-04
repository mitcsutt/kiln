import data from '../../.generated/api.json'

export interface ApiProp {
  name: string
  type: string
  required: boolean
  default?: string
  description: string
  deprecated?: boolean
}

export interface ApiEntry {
  name: string
  package: string
  kind: 'component' | 'function' | 'type' | 'constant'
  description: string
  signature?: string
  props?: ApiProp[]
  extends?: string[]
  members?: string[]
}

const api = data as Record<string, ApiEntry | undefined>

/** An export of kiln-ui or kiln-forms, read from the types by scripts/generate-api.ts. */
export function getApi(name: string): ApiEntry {
  const entry = api[name]
  if (!entry) throw new Error(`No export named ${name} in kiln-ui or kiln-forms.`)
  return entry
}

export function allApi(): ApiEntry[] {
  return Object.values(api).filter((entry): entry is ApiEntry => Boolean(entry))
}
