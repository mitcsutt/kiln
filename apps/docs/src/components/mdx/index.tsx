import type { MDXComponents } from 'mdx/types'
import { Callout } from './client'
import { Choice, DecisionPair } from './DecisionPair'
import {
  ColourSwatches,
  DepthRoles,
  MotionDemo,
  RadiusRoles,
  SpaceScale,
  TypeScale,
} from '../foundations/Specimens'
import { ThemeCompare, ThemeSpecimen } from '../foundations/Themes'
import { ApiSignature, ApiTable, Example } from './components'
import {
  ComponentTokens,
  ContractTokens,
  OptionalThemeTokens,
  StarterThemeFile,
} from './foundations'

/**
 * Kiln's MDX components, which every page can use without importing them, beside kiln-docs'
 * own: `pre`, `a` and `Variant`.
 */
export function getMDXComponents(): MDXComponents {
  return {
    Example,
    ApiTable,
    ApiSignature,
    Callout,
    DecisionPair,
    Choice,
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
