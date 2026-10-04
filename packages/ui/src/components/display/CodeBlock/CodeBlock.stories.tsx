import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeBlock } from './CodeBlock'

const invalidate = `import type { QueryClient } from '@tanstack/react-query'
import { keys } from './keys'

export type Domain = 'invoices' | 'projects'

/** Which cached resources a server-side change makes stale. */
const affected: Record<Domain, readonly (keyof typeof keys)[]> = {
  invoices: ['invoices', 'clients', 'reports'],
  projects: ['projects', 'reports'],
}

export function invalidateForDomain(qc: QueryClient, domain: Domain) {
  return Promise.all(
    affected[domain].map((key) => qc.invalidateQueries({ queryKey: keys[key].all })),
  )
}
`

const meta = {
  title: 'UI/Display/CodeBlock',
  component: CodeBlock,
  args: {
    code: invalidate,
    title: 'queries/invalidate.ts',
    language: 'TypeScript',
    showLineNumbers: true,
    highlightLines: [7, 8, 9, 10],
    copyable: true,
    wrap: false,
  },
} satisfies Meta<typeof CodeBlock>

export default meta
type Story = StoryObj<typeof meta>

/** A push path: the server says a domain changed, these queries refetch. */
export const Playground: Story = {}

/** A command in a README: no filename, no numbers. */
export const Command: Story = {
  args: {
    code: 'pnpm --filter @acme/server db:migrate',
    title: undefined,
    language: 'bash',
    showLineNumbers: false,
    highlightLines: undefined,
  },
}

/** Long lines wrap in narrow columns instead of scrolling. */
export const Wrapped: Story = {
  args: {
    code: `VITE_API_ORIGIN=https://api.example.com pnpm --filter @acme/web dev  # read-only against production data`,
    title: 'Run the SPA against production',
    language: 'bash',
    showLineNumbers: false,
    highlightLines: undefined,
    wrap: true,
  },
}
