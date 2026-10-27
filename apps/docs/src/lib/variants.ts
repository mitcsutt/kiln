import { createVariants } from '@mitcsutt/kiln-docs/variants'
import config from '../../site.config'

export { dedent, type VariantKey, type VariantSelection } from '@mitcsutt/kiln-docs/variants'

/** Kiln's variant blocks (ADR 0038), over the axes in `site.config.ts`. */
export const {
  resolveVariants,
  splitVariants,
  variantLabel,
  variantOf,
  variantRuns,
  variantValues,
} = createVariants(config.variants)
