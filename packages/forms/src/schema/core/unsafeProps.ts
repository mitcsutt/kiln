/**
 * Props a schema node must never pass to a component (§10.8). Schema props are
 * untrusted: default layouts and fields spread unknown props onto DOM elements, so a JSON
 * `dangerouslySetInnerHTML` or `javascript:` URL would reach the page. `parseFormSchema` rejects
 * these, and the renderer strips them (defence in depth for schemas that skip the parser).
 */

/** A schema prop key must be a React camelCase prop name (`label`, `addLabel`). */
const PROP_KEY = /^[a-z][a-zA-Z0-9]*$/

/**
 * Keys never allowed on a node's props, compared case-insensitively: DOM sinks
 * (`className`/`children` match `JsonProps`' dropped keys; a layout's `children` is a schema key),
 * form-submission retargeting (`form`, `action`, `formAction`), and the props the renderer itself
 * supplies (`validators`, `listeners`, `node`, `scopeNames`), which JSON could otherwise replace
 * with a non-function and crash the render.
 */
const BLOCKED_KEYS: ReadonlySet<string> = new Set(
  [
    'dangerouslySetInnerHTML',
    'ref',
    'key',
    'style',
    'className',
    'children',
    'srcDoc',
    'form',
    'action',
    'formAction',
    'formMethod',
    'formEncType',
    'formTarget',
    'formNoValidate',
    'validators',
    'listeners',
    'node',
    'scopeNames',
    // A native `<input pattern>` runs on every change, even under `noValidate` (ReDoS).
    'pattern',
  ].map((key) => key.toLowerCase()),
)

/** Event handler props (`onClick`, `onfocus`, …), any case. */
const HANDLER = /^on/i

/** Props whose string value the browser may navigate to or load (lower-cased). */
const URL_KEYS: ReadonlySet<string> = new Set([
  'href',
  'src',
  'srcset',
  'xlinkhref',
  'data',
  'poster',
  'cite',
  'background',
  'ping',
])

/** Field `type` values that turn an input into a button, file picker or hidden value. */
const BLOCKED_FIELD_TYPES: ReadonlySet<string> = new Set([
  'submit',
  'reset',
  'button',
  'image',
  'file',
  'hidden',
])

/** Schemes that run script (or load arbitrary HTML) when a URL prop is followed. */
const UNSAFE_SCHEME = /^(?:javascript|vbscript|data):/i

/** Browsers ignore ASCII control characters and whitespace inside a scheme (`java\tscript:`). */
function normaliseUrl(value: string): string {
  // eslint-disable-next-line no-control-regex -- matching control characters is the point
  return value.replace(/[\u0000- ]/g, '')
}

/**
 * Why a prop is not allowed on a schema node, or `undefined` when it is fine. `onField`: the node
 * is a field node, whose `type` may not make its input a button, file picker or hidden input.
 */
export function unsafePropReason(key: string, value: unknown, onField = false): string | undefined {
  if (!PROP_KEY.test(key)) return `Prop "${key}" is not a camelCase prop name`
  const lower = key.toLowerCase()
  if (BLOCKED_KEYS.has(lower)) return `Prop "${key}" is not allowed in a schema`
  if (HANDLER.test(key)) return `Event handler prop "${key}" is not allowed in a schema`
  if (URL_KEYS.has(lower) && typeof value === 'string' && UNSAFE_SCHEME.test(normaliseUrl(value))) {
    return `Prop "${key}" may not use a javascript:, vbscript: or data: URL`
  }
  if (
    onField &&
    lower === 'type' &&
    typeof value === 'string' &&
    BLOCKED_FIELD_TYPES.has(value.trim().toLowerCase())
  ) {
    return `Field type "${value}" is not allowed in a schema`
  }
  return undefined
}
