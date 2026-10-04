'use client'

import React from 'react'
import { MorphIcon, type MorphIconProps } from 'morphicons/react'
import {
  ArrowUp as ArrowUpData,
  ArrowDown as ArrowDownData,
  Bold as BoldData,
  Italic as ItalicData,
  Underline as UnderlineData,
  List as ListData,
  ListOrdered as ListOrderedData,
  Link as LinkData,
  Unlink as UnlinkData,
  ArrowRight as ArrowRightData,
  ArrowUpRight as ArrowUpRightData,
  BriefcaseBusiness as BriefcaseBusinessData,
  CalendarClock as CalendarClockData,
  Check as CheckData,
  Clock3 as Clock3Data,
  FileText as FileTextData,
  ChevronDown as ChevronDownData,
  ChevronLeft as ChevronLeftData,
  ChevronRight as ChevronRightData,
  CircleDollarSign as CircleDollarSignData,
  CircleHelp as CircleHelpData,
  Command as CommandData,
  Copy as CopyData,
  Eye as EyeData,
  EyeOff as EyeOffData,
  FolderKanban as FolderKanbanData,
  GripVertical as GripVerticalData,
  History as HistoryData,
  Image as ImageData,
  ImagePlus as ImagePlusData,
  Layers as LayersData,
  LayoutDashboard as LayoutDashboardData,
  LayoutGrid as LayoutGridData,
  LoaderCircle as LoaderCircleData,
  LogOut as LogOutData,
  Menu as MenuData,
  Ellipsis as EllipsisData,
  Monitor as MonitorData,
  PanelLeft as PanelLeftData,
  PanelRight as PanelRightData,
  PanelsTopLeft as PanelsTopLeftData,
  Plus as PlusData,
  Redo2 as Redo2Data,
  RefreshCcw as RefreshCcwData,
  Save as SaveData,
  Search as SearchData,
  SearchX as SearchXData,
  Settings as SettingsData,
  Settings2 as Settings2Data,
  SlidersHorizontal as SlidersHorizontalData,
  Smartphone as SmartphoneData,
  Sparkles as SparklesData,
  Trash2 as Trash2Data,
  Undo2 as Undo2Data,
  Upload as UploadData,
  UserPlus as UserPlusData,
  Users as UsersData,
  Video as VideoData,
  X as XData,
} from 'lucide'

const icons = {
  ArrowUp: ArrowUpData,
  ArrowDown: ArrowDownData,
  Bold: BoldData,
  Italic: ItalicData,
  Underline: UnderlineData,
  List: ListData,
  ListOrdered: ListOrderedData,
  Link: LinkData,
  Unlink: UnlinkData,

  ArrowRight: ArrowRightData,
  ArrowUpRight: ArrowUpRightData,
  BriefcaseBusiness: BriefcaseBusinessData,
  CalendarClock: CalendarClockData,
  Check: CheckData,
  Clock3: Clock3Data,
  FileText: FileTextData,
  ChevronDown: ChevronDownData,
  ChevronLeft: ChevronLeftData,
  ChevronRight: ChevronRightData,
  CircleDollarSign: CircleDollarSignData,
  CircleHelp: CircleHelpData,
  Command: CommandData,
  Copy: CopyData,
  Eye: EyeData,
  EyeOff: EyeOffData,
  FolderKanban: FolderKanbanData,
  GripVertical: GripVerticalData,
  History: HistoryData,
  Image: ImageData,
  ImagePlus: ImagePlusData,
  Layers: LayersData,
  LayoutDashboard: LayoutDashboardData,
  LayoutGrid: LayoutGridData,
  LoaderCircle: LoaderCircleData,
  LogOut: LogOutData,
  Menu: MenuData,
  Ellipsis: EllipsisData,
  Monitor: MonitorData,
  PanelLeft: PanelLeftData,
  PanelRight: PanelRightData,
  PanelsTopLeft: PanelsTopLeftData,
  Plus: PlusData,
  Redo2: Redo2Data,
  RefreshCcw: RefreshCcwData,
  Save: SaveData,
  Search: SearchData,
  SearchX: SearchXData,
  Settings: SettingsData,
  Settings2: Settings2Data,
  SlidersHorizontal: SlidersHorizontalData,
  Smartphone: SmartphoneData,
  Sparkles: SparklesData,
  Trash2: Trash2Data,
  Undo2: Undo2Data,
  Upload: UploadData,
  UserPlus: UserPlusData,
  Users: UsersData,
  Video: VideoData,
  X: XData,
}

export type StudioIconName = keyof typeof icons
type IconProps = Omit<MorphIconProps, 'icon' | 'from' | 'to' | 'name'>

export function StudioIcon({ name, size = 18, strokeWidth = 1.7, ...props }: IconProps & { name: StudioIconName }) {
  return <MorphIcon icon={icons[name]} size={size} strokeWidth={strokeWidth} spring="smooth" reducedMotion="user" {...props} />
}

export function ArrowRight(props: IconProps) { return <StudioIcon name="ArrowRight" {...props} /> }
export function ArrowUpRight(props: IconProps) { return <StudioIcon name="ArrowUpRight" {...props} /> }
export function BriefcaseBusiness(props: IconProps) { return <StudioIcon name="BriefcaseBusiness" {...props} /> }
export function CalendarClock(props: IconProps) { return <StudioIcon name="CalendarClock" {...props} /> }
export function Check(props: IconProps) { return <StudioIcon name="Check" {...props} /> }
export function Clock3(props: IconProps) { return <StudioIcon name="Clock3" {...props} /> }
export function FileText(props: IconProps) { return <StudioIcon name="FileText" {...props} /> }
export function ChevronDown(props: IconProps) { return <StudioIcon name="ChevronDown" {...props} /> }
export function ChevronLeft(props: IconProps) { return <StudioIcon name="ChevronLeft" {...props} /> }
export function ChevronRight(props: IconProps) { return <StudioIcon name="ChevronRight" {...props} /> }
export function CircleDollarSign(props: IconProps) { return <StudioIcon name="CircleDollarSign" {...props} /> }
export function CircleHelp(props: IconProps) { return <StudioIcon name="CircleHelp" {...props} /> }
export function Command(props: IconProps) { return <StudioIcon name="Command" {...props} /> }
export function Copy(props: IconProps) { return <StudioIcon name="Copy" {...props} /> }
export function Eye(props: IconProps) { return <StudioIcon name="Eye" {...props} /> }
export function EyeOff(props: IconProps) { return <StudioIcon name="EyeOff" {...props} /> }
export function FolderKanban(props: IconProps) { return <StudioIcon name="FolderKanban" {...props} /> }
export function GripVertical(props: IconProps) { return <StudioIcon name="GripVertical" {...props} /> }
export function History(props: IconProps) { return <StudioIcon name="History" {...props} /> }
export function Image(props: IconProps) { return <StudioIcon name="Image" {...props} /> }
export function ImagePlus(props: IconProps) { return <StudioIcon name="ImagePlus" {...props} /> }
export function Layers(props: IconProps) { return <StudioIcon name="Layers" {...props} /> }
export function LayoutDashboard(props: IconProps) { return <StudioIcon name="LayoutDashboard" {...props} /> }
export function LayoutGrid(props: IconProps) { return <StudioIcon name="LayoutGrid" {...props} /> }
export function LoaderCircle(props: IconProps) { return <StudioIcon name="LoaderCircle" {...props} /> }
export function LogOut(props: IconProps) { return <StudioIcon name="LogOut" {...props} /> }
export function Menu(props: IconProps) { return <StudioIcon name="Menu" {...props} /> }
export function Monitor(props: IconProps) { return <StudioIcon name="Monitor" {...props} /> }
export function PanelLeft(props: IconProps) { return <StudioIcon name="PanelLeft" {...props} /> }
export function PanelRight(props: IconProps) { return <StudioIcon name="PanelRight" {...props} /> }
export function PanelsTopLeft(props: IconProps) { return <StudioIcon name="PanelsTopLeft" {...props} /> }
export function Plus(props: IconProps) { return <StudioIcon name="Plus" {...props} /> }
export function Redo2(props: IconProps) { return <StudioIcon name="Redo2" {...props} /> }
export function RefreshCcw(props: IconProps) { return <StudioIcon name="RefreshCcw" {...props} /> }
export function Save(props: IconProps) { return <StudioIcon name="Save" {...props} /> }
export function Search(props: IconProps) { return <StudioIcon name="Search" {...props} /> }
export function SearchX(props: IconProps) { return <StudioIcon name="SearchX" {...props} /> }
export function Settings(props: IconProps) { return <StudioIcon name="Settings" {...props} /> }
export function Settings2(props: IconProps) { return <StudioIcon name="Settings2" {...props} /> }
export function SlidersHorizontal(props: IconProps) { return <StudioIcon name="SlidersHorizontal" {...props} /> }
export function Smartphone(props: IconProps) { return <StudioIcon name="Smartphone" {...props} /> }
export function Sparkles(props: IconProps) { return <StudioIcon name="Sparkles" {...props} /> }
export function Trash2(props: IconProps) { return <StudioIcon name="Trash2" {...props} /> }
export function Undo2(props: IconProps) { return <StudioIcon name="Undo2" {...props} /> }
export function Upload(props: IconProps) { return <StudioIcon name="Upload" {...props} /> }
export function UserPlus(props: IconProps) { return <StudioIcon name="UserPlus" {...props} /> }
export function Users(props: IconProps) { return <StudioIcon name="Users" {...props} /> }
export function X(props: IconProps) { return <StudioIcon name="X" {...props} /> }

export function ArrowUp(props: IconProps) { return <StudioIcon name="ArrowUp" {...props} /> }
export function ArrowDown(props: IconProps) { return <StudioIcon name="ArrowDown" {...props} /> }
export function Bold(props: IconProps) { return <StudioIcon name="Bold" {...props} /> }
export function Italic(props: IconProps) { return <StudioIcon name="Italic" {...props} /> }
export function Underline(props: IconProps) { return <StudioIcon name="Underline" {...props} /> }
export function List(props: IconProps) { return <StudioIcon name="List" {...props} /> }
export function ListOrdered(props: IconProps) { return <StudioIcon name="ListOrdered" {...props} /> }
export function Link(props: IconProps) { return <StudioIcon name="Link" {...props} /> }
export function Unlink(props: IconProps) { return <StudioIcon name="Unlink" {...props} /> }
