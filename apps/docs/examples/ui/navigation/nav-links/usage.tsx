'use client'

import { NavLinks, Stack } from '@mitcsutt/kiln-ui'

const LINKS = ['Departures', 'Routes', 'Fares', 'Accessibility']

export default function Usage() {
  return (
    <Stack gap={6}>
      <NavLinks label="Main">
        {LINKS.map((link, index) => (
          <NavLinks.Item key={link} href={`#${link.toLowerCase()}`} active={index === 1}>
            {link}
          </NavLinks.Item>
        ))}
      </NavLinks>
      <NavLinks label="Account" orientation="vertical" size="sm">
        <NavLinks.Item href="#profile" active>
          Profile
        </NavLinks.Item>
        <NavLinks.Item href="#passes">Passes</NavLinks.Item>
        <NavLinks.Item href="#history">Trip history</NavLinks.Item>
      </NavLinks>
    </Stack>
  )
}
