import type { MDXComponents } from 'mdx/types'
import { Callout } from './client'
import {
  ColourSwatches,
  DepthRoles,
  MotionDemo,
  RadiusRoles,
  SpaceScale,
  TypeScale,
} from '../foundations/Specimens'
import { ThemeCompare, ThemeSpecimen } from '../foundations/Themes'
import { Anchor, ApiSignature, ApiTable, Example, Pre } from './components'
import {
  ComponentTokens,
  ContractTokens,
  OptionalThemeTokens,
  StarterThemeFile,
} from './foundations'

/** Everything an MDX page can use without importing it. */
export function getMDXComponents(): MDXComponents {
  return {
    pre: Pre,
    a: Anchor,
    Example,
    ApiTable,
    ApiSignature,
    Callout,
    ColourSwatches,
    TypeScale,
    SpaceScale,
    RadiusRoles,
    DepthRoles,
    MotionDemo,
    ThemeCompare,
    ThemeSpecimen,
    ContractTokens,
    OptionalThemeTokens,
    StarterThemeFile,
    ComponentTokens,
  }
}
