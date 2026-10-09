import { formatDate } from '#utils/formatDate'

export function AppSidebar() {
  return <nav>{formatDate(new Date())}</nav>
}
