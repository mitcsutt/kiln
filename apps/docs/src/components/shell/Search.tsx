'use client'

import {
  Button,
  Dialog,
  Input,
  Kbd,
  List,
  SearchIcon,
  Spinner,
  Stack,
  Text,
} from '@mitcsutt/kiln-ui'
import { useDocsSearch } from 'fumadocs-core/search/client'
import { staticClient } from 'fumadocs-core/search/client/orama-static'
import { useRouter } from 'next/navigation'
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import styles from './Search.module.css'

const client = staticClient({ from: '/api/search' })

/** Search results arrive as Markdown with `<mark>` around the matches. Render only the marks. */
function highlighted(content: string): ReactNode[] {
  const plain = content.replace(/[*_`#[\]]/g, '')
  return plain.split(/(<mark>.*?<\/mark>)/g).map((part, index) => {
    const match = /^<mark>(.*)<\/mark>$/.exec(part)
    return match ? <mark key={index}>{match[1]}</mark> : part
  })
}

export function Search() {
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const { search, setSearch, query } = useDocsSearch({ client })
  const pages = useMemo(
    () => (query.data === 'empty' || !query.data ? [] : query.data.slice(0, 30)),
    [query.data],
  )

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault()
        setOpen((value) => !value)
      }
    }
    window.addEventListener('keydown', onKey)
    return () => {
      window.removeEventListener('keydown', onKey)
    }
  }, [])

  const go = (url: string) => {
    setOpen(false)
    setSearch('')
    router.push(url)
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <Dialog.Trigger asChild>
        <Button
          variant="outline"
          tone="neutral"
          size="sm"
          leadingIcon={<SearchIcon />}
          trailingIcon={<Kbd size="sm">⌘K</Kbd>}
        >
          Search
        </Button>
      </Dialog.Trigger>
      <Dialog.Content title="Search the docs" size="lg">
        <Stack gap={4}>
          <Input
            type="search"
            aria-label="Search"
            placeholder="Button, FormSteps, tokens…"
            value={search}
            onChange={(event) => {
              setSearch(event.target.value)
            }}
            onKeyDown={(event) => {
              const first = pages[0]
              if (event.key === 'Enter' && first) go(first.url)
            }}
            trailing={query.isLoading ? <Spinner size="sm" label="Searching" /> : undefined}
          />
          {search && !query.isLoading && pages.length === 0 ? (
            <Text tone="muted">Nothing matches “{search}”.</Text>
          ) : null}
          {pages.length ? (
            <List divided density="compact" aria-label="Results" className={styles.results}>
              {pages.map((result) => (
                <List.Item key={result.id}>
                  <a
                    href={result.url}
                    className={styles.result}
                    data-type={result.type}
                    onClick={(event) => {
                      event.preventDefault()
                      go(result.url)
                    }}
                  >
                    <Text
                      as="span"
                      size="sm"
                      weight={result.type === 'page' ? 'strong' : 'regular'}
                    >
                      {highlighted(result.content)}
                    </Text>
                    {result.breadcrumbs?.length ? (
                      <Text as="span" size="xs" tone="muted">
                        {result.breadcrumbs.join(' / ')}
                      </Text>
                    ) : null}
                  </a>
                </List.Item>
              ))}
            </List>
          ) : null}
        </Stack>
      </Dialog.Content>
    </Dialog>
  )
}
