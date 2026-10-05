import {
  AppShell,
  ArrowRightIcon,
  BottomNav,
  CircleCheckIcon,
  Container,
  Heading,
  Inline,
  NavLinks,
  SearchIcon,
  Stack,
  SystemIcon,
  Text,
} from '@mitcsutt/kiln-ui'

const SECTIONS = ['Departures', 'Routes', 'Tickets', 'Account']
const ICONS = [
  <ArrowRightIcon key="d" />,
  <SearchIcon key="r" />,
  <CircleCheckIcon key="t" />,
  <SystemIcon key="a" />,
]

export function Usage() {
  return (
    <AppShell navBreakpoint="md">
      <AppShell.Header>
        <Container width="full">
          <Inline justify="between">
            <Text weight="strong">Bayline</Text>
            <NavLinks label="Main" size="sm" hideBelow="md">
              {SECTIONS.map((section, index) => (
                <NavLinks.Item
                  key={section}
                  href={`#${section.toLowerCase()}`}
                  active={index === 0}
                >
                  {section}
                </NavLinks.Item>
              ))}
            </NavLinks>
          </Inline>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Container width="text">
          <Stack gap={4}>
            <Heading level={2} size="2xl">
              Departures from Harbour Square
            </Heading>
            {Array.from({ length: 12 }, (_, index) => (
              <Text key={index}>
                {String(7 + Math.floor(index / 2)).padStart(2, '0')}:{index % 2 ? '40' : '10'}{' '}
                Coastal line to Kelso Bay
              </Text>
            ))}
          </Stack>
        </Container>
      </AppShell.Main>
      <AppShell.BottomBar>
        <BottomNav position="static" hideAbove="md" label="Main">
          {SECTIONS.map((section, index) => (
            <BottomNav.Item
              key={section}
              href={`#${section.toLowerCase()}`}
              icon={ICONS[index]}
              label={section}
              active={index === 0}
            />
          ))}
        </BottomNav>
      </AppShell.BottomBar>
    </AppShell>
  )
}
