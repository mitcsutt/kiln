import { ContactHeader } from './components/ContactHeader'
import { ContactOverview } from './components/sections/ContactOverview'
import { contactSelection } from './stores/contactSelection'

export function Contact() {
  return (
    <article>
      <ContactHeader />
      <ContactOverview />
      {contactSelection.size}
    </article>
  )
}
