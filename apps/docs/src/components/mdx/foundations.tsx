import tokens from '../../../.generated/tokens.json'
import {
  ComponentTokenTable,
  OptionalTokens,
  StarterTheme,
  TokenReference,
} from '../foundations/Tokens'

/** The token contract, read from Paper by scripts/generate-tokens.ts. */
export function ContractTokens() {
  return <TokenReference groups={tokens.groups} />
}

export function OptionalThemeTokens() {
  return <OptionalTokens names={tokens.optional} />
}

/** A complete theme file to copy: every contract token, starting from Paper's values. */
export function StarterThemeFile() {
  return <StarterTheme css={tokens.starterTheme} />
}

const componentTokens = tokens.components as Record<
  string,
  { name: string; description: string }[] | undefined
>

/** A component's own tokens, read from the header comment of its CSS Module. */
export function ComponentTokens({ of }: { of: string }) {
  const list = componentTokens[of]
  if (!list) throw new Error(`${of}.module.css lists no component tokens`)
  return <ComponentTokenTable name={of} tokens={list} />
}
