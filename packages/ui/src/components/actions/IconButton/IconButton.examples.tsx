import {
  Button,
  CloseIcon,
  CopyIcon,
  IconButton,
  Inline,
  MenuIcon,
  MoreIcon,
  PlusIcon,
  SearchIcon,
  Stack,
} from '@mitcsutt/kiln-ui'

export function Usage() {
  return (
    <Inline gap={2}>
      <IconButton label="Search stops" icon={<SearchIcon />} />
      <IconButton label="Copy share link" icon={<CopyIcon />} />
      <IconButton label="More route actions" icon={<MoreIcon />} />
      <IconButton label="Add a stop" icon={<PlusIcon />} variant="solid" tone="accent" />
    </Inline>
  )
}

export function ShapesAndSizes() {
  return (
    <Stack gap={4}>
      <Inline gap={3}>
        <IconButton size="sm" variant="outline" label="Close" icon={<CloseIcon />} />
        <IconButton size="md" variant="outline" label="Close" icon={<CloseIcon />} />
        <IconButton size="lg" variant="outline" label="Close" icon={<CloseIcon />} />
      </Inline>
      <Inline gap={3}>
        <IconButton variant="outline" shape="auto" label="Open menu" icon={<MenuIcon />} />
        <IconButton variant="outline" shape="round" label="Open menu" icon={<MenuIcon />} />
        <IconButton variant="outline" shape="square" label="Open menu" icon={<MenuIcon />} />
      </Inline>
    </Stack>
  )
}

export function BesideButton() {
  return (
    <Inline gap={2}>
      <Button>Publish timetable</Button>
      <IconButton variant="outline" label="More timetable actions" icon={<MoreIcon />} showTitle />
    </Inline>
  )
}
