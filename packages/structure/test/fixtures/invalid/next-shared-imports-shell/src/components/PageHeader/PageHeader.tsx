import { AppShell } from '#app/_shell/components/AppShell'

export function PageHeader({ title }: { title: string }) {
  return <AppShell>{title}</AppShell>
}
