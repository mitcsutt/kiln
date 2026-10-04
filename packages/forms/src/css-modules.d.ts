// @mitcsutt/kiln-ui ships TypeScript source that imports CSS Modules. Its own ambient
// declaration isn't part of this program, so declare the shape here for tsc.
declare module '*.module.css' {
  const classes: Record<string, string>
  export default classes
}
