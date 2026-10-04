'use client'

import {
  ArrowLeftIcon,
  ArrowRightIcon,
  Container,
  Heading,
  Link,
  NavLinks,
  Prose,
  Stack,
  Text,
} from '@mitcsutt/kiln-ui'
import { AnchorProvider, useActiveAnchor, type TOCItemType } from 'fumadocs-core/toc'
import NextLink from 'next/link'
import type { ReactNode } from 'react'
import styles from './PageFrame.module.css'

interface Neighbour {
  url: string
  name: string
}

export interface PageFrameProps {
  title: string
  description?: string
  crumbs: string[]
  markdownUrl: string
  toc: TOCItemType[]
  previous?: Neighbour
  next?: Neighbour
  children: ReactNode
}

function Toc({ items }: { items: TOCItemType[] }) {
  const active = useActiveAnchor()
  if (items.length < 2) return null
  return (
    <Stack gap={3}>
      <Text as="p" size="sm" weight="strong">
        On this page
      </Text>
      <NavLinks orientation="vertical" size="sm" label="On this page">
        {items.map((item) => (
          <NavLinks.Item
            key={item.url}
            href={item.url}
            active={active === item.url.slice(1)}
            data-depth={item.depth}
            className={styles.tocItem}
          >
            {item.title}
          </NavLinks.Item>
        ))}
      </NavLinks>
    </Stack>
  )
}

function Pager({ previous, next }: { previous?: Neighbour; next?: Neighbour }) {
  if (!previous && !next) return null
  return (
    <nav aria-label="Pages" className={styles.pager}>
      {previous ? (
        <NextLink href={previous.url} className={styles.pagerLink} rel="prev">
          <Text as="span" size="sm" tone="muted">
            <ArrowLeftIcon /> Previous
          </Text>
          <Text as="span" weight="strong">
            {previous.name}
          </Text>
        </NextLink>
      ) : (
        <span />
      )}
      {next ? (
        <NextLink href={next.url} className={styles.pagerLink} data-next="" rel="next">
          <Text as="span" size="sm" tone="muted">
            Next <ArrowRightIcon />
          </Text>
          <Text as="span" weight="strong">
            {next.name}
          </Text>
        </NextLink>
      ) : null}
    </nav>
  )
}

export function PageFrame({
  title,
  description,
  crumbs,
  markdownUrl,
  toc,
  previous,
  next,
  children,
}: PageFrameProps) {
  return (
    <AnchorProvider toc={toc} single>
      <Container width="full">
        <div className={styles.layout}>
          <article className={styles.article}>
            <header className={styles.header}>
              <Stack gap={4}>
                {crumbs.length ? (
                  <Text as="p" size="sm" tone="muted">
                    {crumbs.join(' / ')}
                  </Text>
                ) : null}
                <Heading level={1} size="display-sm">
                  {title}
                </Heading>
                {description ? (
                  <Text as="p" size="lg" tone="muted" measure="text">
                    {description}
                  </Text>
                ) : null}
                <Text as="p" size="sm">
                  <Link href={markdownUrl} tone="muted">
                    View as Markdown
                  </Link>
                </Text>
              </Stack>
            </header>
            <Prose className={styles.prose}>{children}</Prose>
            <Pager previous={previous} next={next} />
          </article>
          <aside className={styles.toc} aria-label="On this page">
            <Toc items={toc} />
          </aside>
        </div>
      </Container>
    </AnchorProvider>
  )
}
