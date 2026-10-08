/** `text` without its trailing newlines, found by a backward scan rather than a regex. */
export function trimTrailingNewlines(text: string): string {
  let end = text.length
  while (end > 0 && text[end - 1] === '\n') end--
  return text.slice(0, end)
}
