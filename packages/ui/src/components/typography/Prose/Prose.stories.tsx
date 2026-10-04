import type { Meta, StoryObj } from '@storybook/react-vite'
import { CodeBlock } from '#components/display/CodeBlock'
import { Table } from '#components/display/Table'
import { Alert } from '#components/feedback/Alert'
import { Quote } from '#components/typography/Quote'
import { Prose } from './Prose'

const meta = {
  title: 'UI/Typography/Prose',
  component: Prose,
  args: { size: 'md', as: 'article' },
  parameters: { layout: 'padded' },
} satisfies Meta<typeof Prose>

export default meta
type Story = StoryObj<typeof meta>

const Post = () => (
  <>
    <p>
      Every design system I have worked on died the same way. Not in a rewrite, and not in a rebrand
      — it died the week a product team needed a slightly different button and found it faster to
      copy the component than to ask.
    </p>
    <p>
      This post is about the three changes that stopped that happening, and why a reading app, an
      invoicing tool and a league site can share <a href="#one-library">one component library</a>{' '}
      with completely different personalities.
    </p>
    <h2>Themes are data</h2>
    <p>
      A component never knows which theme it is in. Colour, type, radius, density and motion are all{' '}
      <strong>custom properties</strong>, set once on the root. The same <code>&lt;Button&gt;</code>{' '}
      is a quiet pill here, a chunky sticker on a matchday poster and a crisp ledger key in an
      accounts screen.
    </p>
    <ul>
      <li>Themes set around 120 tokens, and nothing else.</li>
      <li>
        Components read semantic tokens like <code>--color-accent-text</code>, never raw values.
      </li>
      <li>A new theme is one CSS file and zero component changes.</li>
    </ul>
    <blockquote>
      <p>If a screen needs CSS beyond a layout wrapper or two, the library is missing a prop.</p>
    </blockquote>
    <h3>What a token looks like</h3>
    <pre tabIndex={0}>
      <code>{`.button {
  border-radius: var(--button-radius, var(--radius-action));
  font-weight: var(--button-weight, var(--label-weight));
}`}</code>
    </pre>
    <p>
      Press <kbd>⌘</kbd> <kbd>K</kbd> anywhere in the docs to search. The fallback chain means a
      theme can override one component without touching the rest.
    </p>
    <figure>
      <table>
        <thead>
          <tr>
            <th>Theme</th>
            <th>Base size</th>
            <th data-numeric>Ratio</th>
            <th data-numeric>Density</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Monograph</td>
            <td>17px</td>
            <td data-numeric>1.25</td>
            <td data-numeric>1.05</td>
          </tr>
          <tr>
            <td>Fiesta</td>
            <td>16px</td>
            <td data-numeric>1.28</td>
            <td data-numeric>0.92</td>
          </tr>
          <tr>
            <td>Ledger</td>
            <td>15px</td>
            <td data-numeric>1.20</td>
            <td data-numeric>0.86</td>
          </tr>
        </tbody>
      </table>
      <figcaption>
        Three themes, one formula: every size on the scale is the base multiplied by the ratio.
      </figcaption>
    </figure>
    <h2>Ship the boring parts first</h2>
    <ol>
      <li>Layout primitives: stack, inline, grid, split.</li>
      <li>Type: heading, text, prose, numbers.</li>
      <li>Only then the things people screenshot.</li>
    </ol>
    <hr />
    <p>
      <small>
        Thanks to Rosa, Kofi and the rest of the beta group for testing every theme on their phones.
      </small>
    </p>
  </>
)

export const Playground: Story = {
  render: (args) => (
    <Prose {...args}>
      <Post />
    </Prose>
  ),
}

export const Small: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <Prose {...args}>
      <h3>How the league works</h3>
      <p>
        Eight clubs, fourteen rounds. Every club plays every other club twice, once at home and once
        away.
      </p>
      <ul>
        <li>Wins are worth 3 points, draws 1.</li>
        <li>Cup wins count double.</li>
      </ul>
    </Prose>
  ),
}

export const Large: Story = {
  args: { size: 'lg' },
  render: (args) => (
    <Prose {...args}>
      <p>
        Zero-based budgeting has one rule: every dollar has a job before the month starts. Most
        tools for it are still a spreadsheet, just with better typography.
      </p>
      <p>
        September came in at <strong>$4,182.60</strong> against a plan of $5,200 — the first month
        groceries stayed under <mark>$650</mark>.
      </p>
    </Prose>
  ),
}

/**
 * Library components inside Prose keep their own styling: Prose stops at any element
 * with `data-kiln-component` (CodeBlock, Quote, Table, Alert, Card, Code, Kbd), so only
 * the raw HTML around them — and the raw `<code>` in the paragraph — takes prose styles.
 */
export const WithComponents: Story = {
  render: (args) => (
    <Prose {...args}>
      <p>
        Build every query from one factory. Call <code>tableQuery(divisionId)</code> in a component,
        a loader or an invalidation and you get the same key, so a push event for{' '}
        <code>results</code> refreshes the table without a reload.
      </p>
      <CodeBlock
        title="src/queries/table.ts"
        language="ts"
        code={`export const tableQuery = (divisionId: string) =>\n  queryOptions({\n    queryKey: keys.table(divisionId),\n    queryFn: () => get<LeagueTable>(\`/api/table/\${divisionId}\`),\n  })`}
      />
      <p>The table it feeds, after round 3:</p>
      <Table density="compact">
        <Table.Head>
          <Table.Row>
            <Table.HeaderCell>Team</Table.HeaderCell>
            <Table.HeaderCell numeric>Pts</Table.HeaderCell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell rowHeader>Harbour Hawks</Table.Cell>
            <Table.Cell numeric>7</Table.Cell>
          </Table.Row>
          <Table.Row highlighted>
            <Table.Cell rowHeader>Eastgate United</Table.Cell>
            <Table.Cell numeric>5</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
      <Quote cite="Kofi Grant, club secretary">It updated before the replay finished.</Quote>
      <Alert tone="info" title="Deferred">
        Caching responses at the edge is planned, not built yet.
      </Alert>
    </Prose>
  ),
}
