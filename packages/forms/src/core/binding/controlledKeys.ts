/** Props a bound field owns: never passed through from the field's public props (§4.1). */
export type ControlledKeys =
  | 'value'
  | 'defaultValue'
  | 'onValueChange'
  | 'onChange'
  | 'name'
  | 'id'
  | 'error'
  | 'warning'
  | 'errorLive'
  | 'errorHidden'
  | 'validating'
