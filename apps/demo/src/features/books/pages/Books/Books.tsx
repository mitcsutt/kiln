import {
  Button,
  Divider,
  Heading,
  Page,
  SectionHeader,
  Split,
  Stack,
  Text,
} from '@mitcsutt/kiln-ui'
import { Link as RouterLink } from '@tanstack/react-router'

import { PageHeader } from '#components/PageHeader'
import type { Ledger } from '#features/books/data/ledger'

import { Budget } from './components/sections/Budget'
import { Invoices } from './components/sections/Invoices'
import { Overview } from './components/sections/Overview'
import { Transactions } from './components/sections/Transactions'
import { Trends } from './components/sections/Trends'

/** The co-op's books: balance, trends, every transaction, the budget and open invoices. */
export function Books({ ledger }: { ledger: Ledger }) {
  return (
    <Page>
      <PageHeader
        kicker="Books"
        title="Ledger"
        description="Figures the treasurer signs off each month. Amounts line up, negatives read as accounting."
        theme="ledger"
        actions={
          <Button asChild>
            <RouterLink to="/books/new-invoice">New invoice</RouterLink>
          </Button>
        }
      />
      <Overview ledger={ledger} />
      <Divider />
      <Page.Section title="Trends" description="May to October.">
        <Trends ledger={ledger} />
      </Page.Section>
      <Page.Section title="Transactions">
        <Transactions transactions={ledger.transactions} />
      </Page.Section>
      <Split ratio="1/3" gap={{ base: 5, md: 7 }}>
        <Stack gap={2}>
          <Heading level={2} size="lg">
            Budget
          </Heading>
          <Text tone="muted">
            Kilns are the heaviest line: electricity is 61% of what they cost.
          </Text>
        </Stack>
        <Budget budget={ledger.budget} />
      </Split>
      <Stack gap={5}>
        <SectionHeader level={2} size="lg" title="Invoices" divider />
        <Invoices invoices={ledger.invoices} />
      </Stack>
    </Page>
  )
}
