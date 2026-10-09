import './globals.css'
import { AppShell } from '#app/_shell/components/AppShell'

export const metadata = { title: 'CRM' }

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  )
}
