/**
 * The element a story's `play` queries. The workbench's "All themes, side by side"
 * view renders the story once per theme, each in a `.sb-matrix-cell`; the play
 * drives the first copy. Elsewhere it is the canvas itself.
 */
export function storyRoot(canvasElement: HTMLElement): HTMLElement {
  return canvasElement.querySelector<HTMLElement>('.sb-matrix-cell') ?? canvasElement
}
