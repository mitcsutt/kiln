import { forwardRef, type HTMLAttributes } from 'react'
import { Slot } from 'radix-ui'
import { cx } from '#utils/cx'
import { mergeStyles, responsiveVars, type Responsive } from '#utils/responsive'
import { space, type Space } from '#utils/tokens'
import styles from './Card.module.css'
import { headingTag } from '#utils/heading'

export type CardVariant = 'plain' | 'outline' | 'raised'
export type CardTitleLevel = 2 | 3 | 4 | 5 | 6
export type CardMediaRatio = '1/1' | '4/3' | '3/2' | '16/9' | '21/9'

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  /**
   * Edge treatment. `outline` (default) is a hairline; `plain` is a fill with no edge;
   * `raised` stands on `--shadow-surface` (nothing extra in Monograph/Ledger, the print
   * offset in Fiesta).
   */
  variant?: CardVariant
  /** Inner padding as a space step. Responsive. Default `5`. */
  padding?: Responsive<Space>
  /** Hover/press affordance for cards that *are* the action. Implied by `asChild`. */
  interactive?: boolean
  /**
   * Render the single child element as the card — usually a link, so the whole card is
   * one target: `<Card asChild><a href="/projects/atlas">…</a></Card>`. Don't nest other
   * links or buttons inside a linked card.
   */
  asChild?: boolean
}

/**
 * A self-contained object: a project, a release, a plan summary. Use sparingly —
 * most content reads better as a List, Table or plain section (DESIGN §2).
 *
 * <Card><Card.Header><Card.Title>Atlas</Card.Title><Card.Meta>2026</Card.Meta></Card.Header>…</Card>
 */
const CardRoot = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'outline', padding, interactive = false, asChild = false, className, style, ...rest },
  ref,
) {
  const Comp = asChild ? Slot.Root : 'div'
  return (
    <Comp
      ref={ref}
      className={cx(styles.card, className)}
      data-kiln-component=""
      data-variant={variant}
      data-interactive={interactive || asChild || undefined}
      style={mergeStyles(responsiveVars('card-padding', padding, space), style)}
      {...rest}
    />
  )
})

export interface CardMediaProps extends HTMLAttributes<HTMLDivElement> {
  /** Crop the media to a fixed ratio (the child img/video is fitted with `cover`). */
  ratio?: CardMediaRatio
  /**
   * Sit inside the padding instead of bleeding to the edges. The corner radius is then
   * the nested radius (outer − padding).
   */
  inset?: boolean
}

/** Image/video slot. Bleeds to the card's edges by default; put it first (or last). */
const CardMedia = forwardRef<HTMLDivElement, CardMediaProps>(function CardMedia(
  { ratio, inset = false, className, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cx(styles.media, className)}
      data-ratio={ratio}
      data-inset={inset || undefined}
      {...rest}
    />
  )
})

const CardHeader = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardHeader(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx(styles.header, className)} {...rest} />
})

export interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  /** Heading element, to fit the page outline. Visual size doesn't change. Default `3`. */
  level?: CardTitleLevel
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(function CardTitle(
  { level = 3, className, ...rest },
  ref,
) {
  const Tag = headingTag(level)
  return <Tag ref={ref} className={cx(styles.title, className)} {...rest} />
})

const CardDescription = forwardRef<HTMLParagraphElement, HTMLAttributes<HTMLParagraphElement>>(
  function CardDescription({ className, ...rest }, ref) {
    return <p ref={ref} className={cx(styles.description, className)} {...rest} />
  },
)

const CardBody = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardBody(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx(styles.body, className)} {...rest} />
})

/** Actions or summary pinned to the bottom of the card (pushes down in equal-height grids). */
const CardFooter = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardFooter(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx(styles.footer, className)} {...rest} />
})

/** Small secondary facts — year, stack, due date. Numbers are tabular. */
const CardMeta = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(function CardMeta(
  { className, ...rest },
  ref,
) {
  return <div ref={ref} className={cx(styles.meta, className)} {...rest} />
})

export const Card = Object.assign(CardRoot, {
  Media: CardMedia,
  Header: CardHeader,
  Title: CardTitle,
  Description: CardDescription,
  Body: CardBody,
  Footer: CardFooter,
  Meta: CardMeta,
})
