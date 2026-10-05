import { ArrowRightIcon, BottomNav, CircleCheckIcon, SearchIcon, StarIcon } from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <BottomNav position="static" hideAbove={false} label="Main">
      <BottomNav.Item href="#departures" icon={<ArrowRightIcon />} label="Departures" active />
      <BottomNav.Item href="#search" icon={<SearchIcon />} label="Search" />
      <BottomNav.Item href="#saved" icon={<StarIcon />} label="Saved" badge={2} />
      <BottomNav.Item href="#tickets" icon={<CircleCheckIcon />} label="Tickets" badge />
    </BottomNav>
  )
}
