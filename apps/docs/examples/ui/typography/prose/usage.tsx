'use client'

import { Prose } from '@mitcsutt/kiln-ui'

export default function Usage() {
  return (
    <Prose as="article">
      <h2>Travelling with a bike</h2>
      <p>
        Bikes ride free on every ferry and on buses marked with the cycle symbol, outside the
        morning peak. Fold-up bikes are welcome at any time.
      </p>
      <ul>
        <li>Two bikes per ferry crossing, first come, first served.</li>
        <li>
          Tandems and cargo bikes need a <strong>booked space</strong>.
        </li>
      </ul>
      <blockquote>Lock your bike to the rack on the car deck, not to the railings.</blockquote>
      <p>
        Questions? Ask a crew member, or <a href="#contact">write to us</a>.
      </p>
    </Prose>
  )
}
