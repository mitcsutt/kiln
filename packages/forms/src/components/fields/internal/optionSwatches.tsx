import type { ReactElement, ReactNode } from 'react'
import { Swatch, Tag, TagList } from '@mitcsutt/kiln-ui'
import type { OptionMapping, UiOption } from '#hooks/useOptionMapping'
import type { Primitive } from '#kit/contracts'

/**
 * Ui options with each option's swatch as its leading glyph (`icon`), for a control that has no
 * swatch of its own per option but has that slot (ChipGroup, SegmentedControl). The slot sets
 * its glyph about 1.2× the label, so the swatch goes a size down to match a `ToggleChip`'s.
 * Options without a swatch are passed through as they are.
 */
export function withSwatchIcons<V extends Primitive>(
  mapping: OptionMapping<V>,
): (UiOption & { icon?: ReactNode })[] {
  return mapping.uiOptions.map((option) => {
    const swatch = mapping.swatchOf(option.value)
    return swatch === undefined ? option : { ...option, icon: <Swatch color={swatch} size="sm" /> }
  })
}

/**
 * A many-of field's chosen options in view mode: one tag each, with the option's swatch, or
 * `undefined` when none are chosen (so `FieldView` shows `messages.notProvided`).
 */
export function optionTags<V extends Primitive>(
  values: readonly V[],
  mapping: OptionMapping<V>,
): ReactElement | undefined {
  if (values.length === 0) return undefined
  return (
    <TagList>
      {values.map((value) => {
        const label = mapping.labelOf(value) ?? String(value)
        const swatch = mapping.swatchOf(value)
        return (
          <Tag key={label} {...(swatch === undefined ? {} : { swatch })}>
            {label}
          </Tag>
        )
      })}
    </TagList>
  )
}
