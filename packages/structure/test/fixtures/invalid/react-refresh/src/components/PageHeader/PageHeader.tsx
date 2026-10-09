export function PageHeader({ title }: { title: string }) {
  return <h1>{title}</h1>
}

export function headerTitle(title: string) {
  return title.toUpperCase()
}
