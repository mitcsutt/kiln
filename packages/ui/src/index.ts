// eslint-disable-next-line @typescript-eslint/triple-slash-reference -- a .d.ts can't be imported, and this one ships the stylesheet declarations
/// <reference path="./stylesheets.d.ts" preserve="true" />
/*
 * @mitcsutt/kiln-ui public API. Everything a consumer may import lives here — no deep imports.
 * Keep sections in the same order as DESIGN.md §6 (Component catalogue).
 */

// Theme
export {
  ThemeProvider,
  ThemeScope,
  useTheme,
  themeScript,
  THEMES,
  THEME_META,
  MODES,
  DEFAULT_THEME,
} from './theme'
export type {
  ThemeProviderProps,
  ThemeScopeProps,
  ThemeContextValue,
  ThemeScriptOptions,
  ThemeName,
  BuiltInThemeName,
  ThemeMeta,
  ColorMode,
} from './theme'

// Utilities & token types
export { cx } from './utils/cx'
export type { Responsive, Breakpoint } from './utils/responsive'
export type { Space, Tone, Size, Width, Align, Justify } from './utils/tokens'
export type { VisibilityProps, VisibilityBreakpoint } from './utils/visibility'

// Icons
export * from './icons'

// Layout
export { Stack } from './components/layout/Stack'
export type { StackProps } from './components/layout/Stack'
export { Inline } from './components/layout/Inline'
export type { InlineProps } from './components/layout/Inline'
export { Box } from './components/layout/Box'
export type { BoxProps, BoxSurface, BoxRadius } from './components/layout/Box'
export { Grid } from './components/layout/Grid'
export type {
  GridProps,
  GridItemProps,
  GridColumns,
  GridMinItemWidth,
  GridSpan,
} from './components/layout/Grid'
export { Split } from './components/layout/Split'
export type { SplitProps, SplitRatio, SplitCollapse } from './components/layout/Split'
export { Container } from './components/layout/Container'
export type { ContainerProps } from './components/layout/Container'
export { Section } from './components/layout/Section'
export type { SectionProps, SectionSurface, SectionDivider } from './components/layout/Section'
export { Divider } from './components/layout/Divider'
export type { DividerProps, DividerOrientation } from './components/layout/Divider'
export { AspectRatio } from './components/layout/AspectRatio'
export type { AspectRatioProps, AspectRatioPreset } from './components/layout/AspectRatio'
export { AppShell } from './components/layout/AppShell'
export type {
  AppShellProps,
  AppShellHeaderProps,
  AppShellMainProps,
  AppShellSidebarProps,
  AppShellFooterProps,
  AppShellBottomBarProps,
} from './components/layout/AppShell'
export { VisuallyHidden } from './components/layout/VisuallyHidden'
export type { VisuallyHiddenProps } from './components/layout/VisuallyHidden'
export { ActionBar } from './components/layout/ActionBar'
export type {
  ActionBarProps,
  ActionBarAlign,
  ActionBarElement,
} from './components/layout/ActionBar'

// Typography
export { Heading, DEFAULT_HEADING_SIZE } from './components/typography/Heading'
export type {
  HeadingProps,
  HeadingLevel,
  HeadingSize,
  HeadingTone,
  HeadingElement,
} from './components/typography/Heading'
export { Text } from './components/typography/Text'
export type {
  TextProps,
  TextSize,
  TextTone,
  TextWeight,
  TextAlign,
  TextElement,
} from './components/typography/Text'
export { Link } from './components/typography/Link'
export type { LinkProps, LinkTone, LinkUnderline } from './components/typography/Link'
export { Code } from './components/typography/Code'
export type { CodeProps, CodeTone } from './components/typography/Code'
export { Kbd } from './components/typography/Kbd'
export type { KbdProps, KbdSize } from './components/typography/Kbd'
export { Prose } from './components/typography/Prose'
export type { ProseProps, ProseSize, ProseElement } from './components/typography/Prose'
export { Quote } from './components/typography/Quote'
export type { QuoteProps, QuoteSize } from './components/typography/Quote'
export { Numeral, formatNumeral, formatNumeralParts, signOf } from './components/typography/Numeral'
export type {
  NumeralProps,
  NumeralTone,
  NumeralSize,
  NumeralSign,
  NumeralPart,
} from './components/typography/Numeral'
export { Amount } from './components/typography/Amount'
export type { AmountProps } from './components/typography/Amount'
export { SectionHeader } from './components/typography/SectionHeader'
export type {
  SectionHeaderProps,
  SectionHeaderElement,
} from './components/typography/SectionHeader'

// Actions
export { Button } from './components/actions/Button'
export type { ButtonProps, ButtonVariant, ButtonTone } from './components/actions/Button'
export { IconButton } from './components/actions/IconButton'
export type { IconButtonProps, IconButtonShape } from './components/actions/IconButton'
export { ToggleChip } from './components/actions/ToggleChip'
export type { ToggleChipProps, ToggleChipSize } from './components/actions/ToggleChip'
export { ChipGroup } from './components/actions/ChipGroup'
export type {
  ChipGroupProps,
  ChipGroupSingleProps,
  ChipGroupMultipleProps,
  ChipGroupSize,
  ChipOption,
} from './components/actions/ChipGroup'
export { SegmentedControl } from './components/actions/SegmentedControl'
export type {
  SegmentedControlProps,
  SegmentedControlItemProps,
  SegmentedControlOption,
} from './components/actions/SegmentedControl'
export { ModeToggle } from './components/actions/ModeToggle'
export type { ModeToggleProps, ModeToggleVariant } from './components/actions/ModeToggle'

// Forms
export { Field, useFieldControl } from './components/inputs/Field'
export type {
  FieldProps,
  FieldLabelProps,
  FieldRenderProps,
  FieldControlContext,
  FieldLayout,
} from './components/inputs/Field'
export { Input } from './components/inputs/Input'
export type { InputProps } from './components/inputs/Input'
export { Textarea } from './components/inputs/Textarea'
export type { TextareaProps } from './components/inputs/Textarea'
export { Select } from './components/inputs/Select'
export type {
  SelectProps,
  SelectOption,
  SelectGroup,
  SelectRootProps,
  SelectTriggerProps,
  SelectContentProps,
  SelectItemProps,
  SelectGroupProps,
  SelectLabelProps,
  SelectSeparatorProps,
} from './components/inputs/Select'
export { Checkbox } from './components/inputs/Checkbox'
export type { CheckboxProps, CheckedState } from './components/inputs/Checkbox'
export { RadioGroup } from './components/inputs/RadioGroup'
export type { RadioGroupProps, RadioGroupItemProps } from './components/inputs/RadioGroup'
export { Switch } from './components/inputs/Switch'
export type { SwitchProps } from './components/inputs/Switch'
export { Fieldset } from './components/inputs/Fieldset'
export type { FieldsetProps } from './components/inputs/Fieldset'
export { TextField } from './components/inputs/TextField'
export type { TextFieldProps } from './components/inputs/TextField'
export { TextareaField } from './components/inputs/TextareaField'
export type { TextareaFieldProps } from './components/inputs/TextareaField'
export { SelectField } from './components/inputs/SelectField'
export type { SelectFieldProps } from './components/inputs/SelectField'
export { CheckboxField } from './components/inputs/CheckboxField'
export type { CheckboxFieldProps } from './components/inputs/CheckboxField'
export { PasswordInput } from './components/inputs/PasswordInput'
export type { PasswordInputProps } from './components/inputs/PasswordInput'
export { PasswordField } from './components/inputs/PasswordField'
export type { PasswordFieldProps } from './components/inputs/PasswordField'
export { NumberInput } from './components/inputs/NumberInput'
export type { NumberInputProps } from './components/inputs/NumberInput'
export { NumberField } from './components/inputs/NumberField'
export type { NumberFieldProps } from './components/inputs/NumberField'
export { AmountInput } from './components/inputs/AmountInput'
export type {
  AmountInputProps,
  AmountUnit,
  AmountCurrencyDisplay,
} from './components/inputs/AmountInput'
export { AmountField } from './components/inputs/AmountField'
export type { AmountFieldProps } from './components/inputs/AmountField'
export { OneTimeCodeInput } from './components/inputs/OneTimeCodeInput'
export type {
  OneTimeCodeInputProps,
  OneTimeCodeValidation,
} from './components/inputs/OneTimeCodeInput'
export { OneTimeCodeField } from './components/inputs/OneTimeCodeField'
export type { OneTimeCodeFieldProps } from './components/inputs/OneTimeCodeField'
export { ColorInput } from './components/inputs/ColorInput'
export type { ColorInputProps, ColorSwatch } from './components/inputs/ColorInput'
export { ColorField } from './components/inputs/ColorField'
export type { ColorFieldProps } from './components/inputs/ColorField'
export { SwitchField } from './components/inputs/SwitchField'
export type { SwitchFieldProps } from './components/inputs/SwitchField'
export { DateRangeField } from './components/inputs/DateRangeField'
export type { DateRangeFieldProps, DateRangeValue } from './components/inputs/DateRangeField'
export { CheckboxGroup } from './components/inputs/CheckboxGroup'
export type {
  CheckboxGroupProps,
  CheckboxGroupItemProps,
  CheckboxGroupColumns,
  ChoiceOption,
} from './components/inputs/CheckboxGroup'
export { CheckboxGroupField } from './components/inputs/CheckboxGroupField'
export type { CheckboxGroupFieldProps } from './components/inputs/CheckboxGroupField'
export { RadioGroupField } from './components/inputs/RadioGroupField'
export type { RadioGroupFieldProps } from './components/inputs/RadioGroupField'
export { SegmentedField } from './components/inputs/SegmentedField'
export type { SegmentedFieldProps } from './components/inputs/SegmentedField'
export { ChipGroupField } from './components/inputs/ChipGroupField'
export type { ChipGroupFieldProps } from './components/inputs/ChipGroupField'
export { ChoiceCards } from './components/inputs/ChoiceCards'
export type {
  ChoiceCardsProps,
  ChoiceCardsSingleProps,
  ChoiceCardsMultipleProps,
  ChoiceCardsColumns,
  ChoiceCardOption,
} from './components/inputs/ChoiceCards'
export { ChoiceCardsField } from './components/inputs/ChoiceCardsField'
export type { ChoiceCardsFieldProps } from './components/inputs/ChoiceCardsField'
export { Slider } from './components/inputs/Slider'
export type { SliderProps, SliderMark, SliderSize } from './components/inputs/Slider'
export { SliderField } from './components/inputs/SliderField'
export type { SliderFieldProps } from './components/inputs/SliderField'
export { RangeSlider } from './components/inputs/RangeSlider'
export type { RangeSliderProps } from './components/inputs/RangeSlider'
export { RangeSliderField } from './components/inputs/RangeSliderField'
export type { RangeSliderFieldProps } from './components/inputs/RangeSliderField'
export { Rating } from './components/inputs/Rating'
export type { RatingProps } from './components/inputs/Rating'
export { RatingField } from './components/inputs/RatingField'
export type { RatingFieldProps } from './components/inputs/RatingField'
export { Combobox } from './components/inputs/Combobox'
export type {
  ComboboxBase,
  ComboboxMultipleProps,
  ComboboxOption,
  ComboboxProps,
  ComboboxSingleProps,
} from './components/inputs/Combobox'
export { ComboboxField } from './components/inputs/ComboboxField'
export type {
  ComboboxFieldMultipleProps,
  ComboboxFieldProps,
  ComboboxFieldSingleProps,
} from './components/inputs/ComboboxField'
export { TagsInput } from './components/inputs/TagsInput'
export type { TagsInputProps, TagsRejectReason } from './components/inputs/TagsInput'
export { TagsField } from './components/inputs/TagsField'
export type { TagsFieldProps } from './components/inputs/TagsField'
export { FileDrop } from './components/inputs/FileDrop'
export type {
  FileDropProps,
  FileRejection,
  FileRejectReason,
  FileValue,
  StoredFile,
} from './components/inputs/FileDrop'
export { FileField } from './components/inputs/FileField'
export type { FileFieldProps } from './components/inputs/FileField'

// Display
export { Card } from './components/display/Card'
export type {
  CardProps,
  CardVariant,
  CardMediaProps,
  CardMediaRatio,
  CardTitleProps,
  CardTitleLevel,
} from './components/display/Card'
export { Badge } from './components/display/Badge'
export type { BadgeProps, BadgeVariant, BadgeSize } from './components/display/Badge'
export { Tag, TagList } from './components/display/Tag'
export type { TagProps, TagColor, TagListProps } from './components/display/Tag'
export { Avatar, getInitials, avatarColor } from './components/display/Avatar'
export type { AvatarProps, AvatarSize, AvatarColor } from './components/display/Avatar'
export { AvatarGroup } from './components/display/AvatarGroup'
export type { AvatarGroupProps } from './components/display/AvatarGroup'
export { Stat } from './components/display/Stat'
export type {
  StatProps,
  StatSize,
  StatDelta,
  StatDeltaDirection,
  StatDeltaTone,
} from './components/display/Stat'
export { DataList } from './components/display/DataList'
export type {
  DataListProps,
  DataListItemProps,
  DataListOrientation,
} from './components/display/DataList'
export { List } from './components/display/List'
export type { ListProps, ListItemProps, ListDensity, ListElement } from './components/display/List'
export { Table } from './components/display/Table'
export type {
  TableProps,
  TableDensity,
  TableVariant,
  TableAlign,
  TableSort,
  TableRowProps,
  TableHeaderCellProps,
  TableCellProps,
} from './components/display/Table'
export { Media } from './components/display/Media'
export type { MediaProps, MediaRatio, MediaFit, MediaRadius } from './components/display/Media'
export { Marquee } from './components/display/Marquee'
export type {
  MarqueeProps,
  MarqueeSpeed,
  MarqueeDirection,
  MarqueeSurface,
} from './components/display/Marquee'
export { CodeBlock } from './components/display/CodeBlock'
export type { CodeBlockProps } from './components/display/CodeBlock'
export { Stamp } from './components/display/Stamp'
export type { StampProps } from './components/display/Stamp'
export { Progress } from './components/display/Progress'
export type { ProgressProps } from './components/display/Progress'
export { Meter, meterTone } from './components/display/Meter'
export type { MeterProps, MeterTone, MeterThresholds } from './components/display/Meter'
export { Skeleton } from './components/display/Skeleton'
export type {
  SkeletonProps,
  SkeletonTextProps,
  SkeletonCircleProps,
  SkeletonWidth,
  SkeletonHeight,
  SkeletonRadius,
} from './components/display/Skeleton'
export { EmptyState } from './components/display/EmptyState'
export type { EmptyStateProps, EmptyStateTitleElement } from './components/display/EmptyState'

// Navigation
export { Tabs } from './components/navigation/Tabs'
export type {
  TabsProps,
  TabsVariant,
  TabsListProps,
  TabsTriggerProps,
  TabsContentProps,
} from './components/navigation/Tabs'
export { NavLinks } from './components/navigation/NavLinks'
export type {
  NavLinksProps,
  NavLinksItemProps,
  NavLinksOrientation,
} from './components/navigation/NavLinks'
export { BottomNav } from './components/navigation/BottomNav'
export type { BottomNavProps, BottomNavItemProps } from './components/navigation/BottomNav'
export { Accordion } from './components/navigation/Accordion'
export type {
  AccordionProps,
  AccordionVariant,
  AccordionSize,
  AccordionItemProps,
  AccordionTriggerProps,
  AccordionContentProps,
} from './components/navigation/Accordion'
export { Stepper } from './components/navigation/Stepper'
export type { StepperProps, StepperStep, StepperStatus } from './components/navigation/Stepper'

// Feedback
export { Spinner } from './components/feedback/Spinner'
export type { SpinnerProps } from './components/feedback/Spinner'
export { Alert } from './components/feedback/Alert'
export type { AlertProps, AlertTone, AlertVariant } from './components/feedback/Alert'
export { LiveIndicator } from './components/feedback/LiveIndicator'
export type { LiveIndicatorProps, LiveIndicatorVariant } from './components/feedback/LiveIndicator'
export { StatusDot } from './components/feedback/StatusDot'
export type { StatusDotProps } from './components/feedback/StatusDot'
export {
  RelativeTime,
  formatRelativeTime,
  formatAbsoluteTime,
} from './components/feedback/RelativeTime'
export type { RelativeTimeProps, RelativeTimeStyle } from './components/feedback/RelativeTime'

// Overlays
export { Dialog } from './components/overlays/Dialog'
export type {
  DialogProps,
  DialogSize,
  DialogTriggerProps,
  DialogContentProps,
  DialogFooterProps,
  DialogTitleProps,
  DialogDescriptionProps,
  DialogCloseProps,
} from './components/overlays/Dialog'
export { Sheet } from './components/overlays/Sheet'
export type {
  SheetProps,
  SheetSide,
  SheetSize,
  SheetTriggerProps,
  SheetContentProps,
  SheetFooterProps,
  SheetTitleProps,
  SheetDescriptionProps,
  SheetCloseProps,
} from './components/overlays/Sheet'
export { Popover } from './components/overlays/Popover'
export type {
  PopoverProps,
  PopoverTriggerProps,
  PopoverAnchorProps,
  PopoverContentProps,
  PopoverCloseProps,
} from './components/overlays/Popover'
export { DropdownMenu } from './components/overlays/DropdownMenu'
export type {
  DropdownMenuProps,
  DropdownMenuTriggerProps,
  DropdownMenuContentProps,
  DropdownMenuItemProps,
  DropdownMenuItemTone,
  DropdownMenuCheckboxItemProps,
  DropdownMenuRadioGroupProps,
  DropdownMenuRadioItemProps,
  DropdownMenuLabelProps,
  DropdownMenuSeparatorProps,
  DropdownMenuGroupProps,
  DropdownMenuSubProps,
  DropdownMenuSubTriggerProps,
  DropdownMenuSubContentProps,
} from './components/overlays/DropdownMenu'
export { Tooltip, TooltipProvider } from './components/overlays/Tooltip'
export type {
  TooltipProps,
  TooltipProviderProps,
  TooltipSide,
  TooltipAlign,
} from './components/overlays/Tooltip'

// Fix round (layout/nav/forms/overlays)
export type { NavLinksSize } from './components/navigation/NavLinks'
export type { AppShellNavBreakpoint } from './components/layout/AppShell'
export type { SheetResponsiveSide } from './components/overlays/Sheet'
export type { FieldsetVariant } from './components/inputs/Fieldset'

// Fix round (display/typography)
export { Delta } from './components/display/Delta'
export type { DeltaProps, DeltaDirection, DeltaTone } from './components/display/Delta'
export type { StatTone } from './components/display/Stat'
export type { TableColumnWidth } from './components/display/Table'
export type { StampPlacement } from './components/display/Stamp'
export type { HeadingMeasure } from './components/typography/Heading'
export type { TextMeasure } from './components/typography/Text'
