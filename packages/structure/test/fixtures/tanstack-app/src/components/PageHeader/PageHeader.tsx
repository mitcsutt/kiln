import styles from './PageHeader.module.css'

export function PageHeader({ title }: { title: string }) {
  return <h1 className={styles.title}>{title}</h1>
}
