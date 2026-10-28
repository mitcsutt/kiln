import { forwardRef, useId, type HTMLAttributes, type ReactNode } from 'react'
import type { Responsive } from '#utils/responsive'
import type { Space } from '#utils/tokens'
import { Stack } from '#components/layout/Stack'
import { SectionHeader } from '#components/typography/SectionHeader'
import type { HeadingLevel, HeadingSize } from '#components/typography/Heading'

export interface PageProps extends HTMLAttributes<HTMLElement> {
  /** Space between the header and each section, as a step on the space scale. Responsive. Default `8`. */
  gap?: Responsive<Space>
}

const PageRoot = forwardRef<HTMLElement, PageProps>(function Page({ gap = 8, ...rest }, ref) {
  return <Stack ref={ref} as="div" gap={gap} {...rest} />
})

interface TitleBlockProps {
  /** A sentence or two under the title. */
  description?: ReactNode
  /** Buttons or links beside the title from `md` up, below it on a phone. */
  actions?: ReactNode
  /** Heading size; defaults from the part (`2xl` for the header, `lg` for a section). Responsive. */
  size?: Responsive<HeadingSize>
}

export interface PageHeaderProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'>, TitleBlockProps {
  /** The page title, as its `<h1>`. */
  title: ReactNode
  /**
   * Small context above the title, only when it tells the reader something: the area the page
   * belongs to, or the period it covers. Plain muted text.
   */
  kicker?: ReactNode
  /** Anything that belongs to the header under the title block: a notice, filters, tabs. */
  children?: ReactNode
}

/** The page's title block: its `<h1>`, a description and actions, and anything that belongs under them. */
const PageHeader = forwardRef<HTMLElement, PageHeaderProps>(function PageHeader(
  { title, kicker, description, actions, size = '2xl', children, ...rest },
  ref,
) {
  return (
    <Stack ref={ref} as="header" gap={4} {...rest}>
      <SectionHeader
        level={1}
        size={size}
        kicker={kicker}
        title={title}
        description={description}
        actions={actions}
      />
      {children}
    </Stack>
  )
})

export interface PageSectionProps
  extends Omit<HTMLAttributes<HTMLElement>, 'title'>, TitleBlockProps {
  /** The section title, as an `<h2>` that also names the section. Omit for an untitled section. */
  title?: ReactNode
  /** Heading level. Default 2. */
  level?: HeadingLevel
  /** Space between the title block and the content, and between content blocks. Default `4`. */
  gap?: Responsive<Space>
}

/** One part of a page: a titled `<section>` with its content at a set distance from the title. */
const PageSection = forwardRef<HTMLElement, PageSectionProps>(function PageSection(
  { title, description, actions, level = 2, size = 'lg', gap = 4, children, ...rest },
  ref,
) {
  const titleId = `page-section-${useId().replace(/[^\w-]/g, '')}`
  const titled = title !== undefined && title !== null
  return (
    <Stack
      ref={ref}
      as="section"
      gap={gap}
      aria-labelledby={titled ? titleId : undefined}
      {...rest}
    >
      {titled ? (
        <SectionHeader
          level={level}
          size={size}
          title={title}
          titleId={titleId}
          description={description}
          actions={actions}
        />
      ) : null}
      {children}
    </Stack>
  )
})

/**
 * The layout of a page inside an app: a title block, then sections, at one rhythm, so pages need
 * no layout of their own.
 *
 * @remarks
 * `Page` is the content of one screen, inside `AppShell.Main` and its `Container`. It spaces its
 * parts at one rhythm, so every page in an app opens and steps the same way:
 *
 * - **`Page.Header`** is the page's `<h1>`, with an optional kicker, description and actions.
 *   Anything you nest in it sits under the title block, like a notice or a filter row.
 * - **`Page.Section`** is a `<section>` named by its `<h2>`, with its content a set distance
 *   below the title. Leave out `title` for a part with no heading. *
 * `AppShell.Main` pads the top and the end of the page, so `Page` adds no outer space of its own.
 * Change the rhythm with `gap` on any part.
 *
 * @privateRemarks
 * Composition only: Stack and SectionHeader with the gaps the demo pages kept repeating
 * (page 8, section 4). No CSS of its own, so nothing for a theme to override here.
 *
 * <Page>
 *   <Page.Header kicker="Books" title="Ledger" description="…" actions={<Button>…</Button>} />
 *   <Page.Section title="This month"><Grid columns={3}>…</Grid></Page.Section>
 * </Page>
 */
export const Page = Object.assign(PageRoot, {
  Header: PageHeader,
  Section: PageSection,
})
