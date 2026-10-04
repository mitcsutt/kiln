import { createIcon } from './Icon'

/* Deliberately few. Components need these; apps bring their own set for everything else. */

export const ChevronDownIcon = createIcon('ChevronDownIcon', <path d="M5.5 8 10 12.5 14.5 8" />)
export const ChevronUpIcon = createIcon('ChevronUpIcon', <path d="M5.5 12 10 7.5 14.5 12" />)
export const ChevronLeftIcon = createIcon('ChevronLeftIcon', <path d="M12 5.5 7.5 10 12 14.5" />)
export const ChevronRightIcon = createIcon('ChevronRightIcon', <path d="M8 5.5 12.5 10 8 14.5" />)
export const CheckIcon = createIcon('CheckIcon', <path d="M4.5 10.5 8.25 14 15.5 6.5" />)
export const CloseIcon = createIcon('CloseIcon', <path d="M5.5 5.5l9 9m0-9-9 9" />)
export const PlusIcon = createIcon('PlusIcon', <path d="M10 4.5v11M4.5 10h11" />)
export const MinusIcon = createIcon('MinusIcon', <path d="M4.5 10h11" />)
export const ArrowLeftIcon = createIcon(
  'ArrowLeftIcon',
  <path d="M15.5 10h-11m4.5-4.5L4.5 10 9 14.5" />,
)
export const ArrowRightIcon = createIcon(
  'ArrowRightIcon',
  <path d="M4.5 10h11M11 5.5l4.5 4.5-4.5 4.5" />,
)
export const ArrowUpRightIcon = createIcon(
  'ArrowUpRightIcon',
  <path d="M6.5 13.5l7-7M7.5 6.5h6v6" />,
)
export const SearchIcon = createIcon(
  'SearchIcon',
  <>
    <circle cx="9" cy="9" r="4.75" />
    <path d="m12.5 12.5 3.5 3.5" />
  </>,
)
export const InfoIcon = createIcon(
  'InfoIcon',
  <>
    <circle cx="10" cy="10" r="7" />
    <path d="M10 9.25v4.25" />
    <path d="M10 6.6v.01" />
  </>,
)
export const WarningIcon = createIcon(
  'WarningIcon',
  <>
    <path d="M10 3.5 17 16H3z" />
    <path d="M10 8.5v3.5" />
    <path d="M10 14.1v.01" />
  </>,
)
export const ErrorIcon = createIcon(
  'ErrorIcon',
  <>
    <circle cx="10" cy="10" r="7" />
    <path d="M10 6.5v4.5" />
    <path d="M10 13.6v.01" />
  </>,
)
export const CircleCheckIcon = createIcon(
  'CircleCheckIcon',
  <>
    <circle cx="10" cy="10" r="7" />
    <path d="m7 10.25 2.1 2 3.9-4.25" />
  </>,
)
export const MenuIcon = createIcon('MenuIcon', <path d="M3.5 6.5h13M3.5 10h13M3.5 13.5h13" />)
export const MoreIcon = createIcon(
  'MoreIcon',
  <path d="M5 10v.01M10 10v.01M15 10v.01" strokeWidth="2.25" />,
)
export const CopyIcon = createIcon(
  'CopyIcon',
  <>
    <rect x="7" y="7" width="9" height="9" rx="1.5" />
    <path d="M13 4.5H5.5a1 1 0 0 0-1 1V13" />
  </>,
)
export const SunIcon = createIcon(
  'SunIcon',
  <>
    <circle cx="10" cy="10" r="3.25" />
    <path d="M10 2.75v1.5M10 15.75v1.5M2.75 10h1.5M15.75 10h1.5M4.9 4.9l1.05 1.05M14.05 14.05l1.05 1.05M4.9 15.1l1.05-1.05M14.05 5.95l1.05-1.05" />
  </>,
)
export const MoonIcon = createIcon(
  'MoonIcon',
  <path d="M15.5 12.4A6.25 6.25 0 0 1 7.6 4.5a6.25 6.25 0 1 0 7.9 7.9Z" />,
)
export const SystemIcon = createIcon(
  'SystemIcon',
  <>
    <rect x="3" y="4" width="14" height="9.5" rx="1.25" />
    <path d="M7.5 16.5h5M10 13.5v3" />
  </>,
)
export const StarIcon = createIcon(
  'StarIcon',
  <path d="M10 3.25 12.3 8l5.2.75-3.75 3.66.9 5.2L10 15.1l-4.65 2.5.9-5.2-3.75-3.66L7.7 8Z" />,
)
export const EyeIcon = createIcon(
  'EyeIcon',
  <>
    <path d="M2.5 10S5.5 4.75 10 4.75 17.5 10 17.5 10 14.5 15.25 10 15.25 2.5 10 2.5 10Z" />
    <circle cx="10" cy="10" r="2.25" />
  </>,
)
export const EyeOffIcon = createIcon(
  'EyeOffIcon',
  <>
    <path d="M4.4 4.4 15.6 15.6" />
    <path d="M8.2 5.05C8.77 4.86 9.37 4.75 10 4.75c4.5 0 7.5 5.25 7.5 5.25s-.85 1.5-2.35 2.85M6.3 6.3C4.15 7.6 2.5 10 2.5 10s3 5.25 7.5 5.25c1.1 0 2.08-.32 2.93-.8" />
    <path d="M7.9 8.15A2.25 2.25 0 0 0 10 12.25c.42 0 .8-.1 1.15-.28" />
  </>,
)
export const UploadIcon = createIcon(
  'UploadIcon',
  <>
    <path d="M10 13.25v-8.5M6.75 8 10 4.75 13.25 8" />
    <path d="M3.75 14.25v1a1.5 1.5 0 0 0 1.5 1.5h9.5a1.5 1.5 0 0 0 1.5-1.5v-1" />
  </>,
)
