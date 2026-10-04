/**
 * Story kit helper: a promise that never resolves or rejects, for an `onDynamicAsync`
 * validator in a "Validating" state demo — paired with `RevealErrors`, it keeps
 * `field.state.meta.isValidating` true forever so the story has something to look at.
 */
export const NEVER_SETTLES = new Promise<never>(() => undefined)
