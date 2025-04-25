
/**
 * @fileOverview Exports a set of icons from the `lucide-react` library.
 *
 * @module Icons
 *
 * @description This module provides a central place to import and export icons,
 * making it easier to use them throughout the application.
 */

import {
    ArrowRight, Award, Book, Check, ChevronsUpDown, Circle, Copy, Edit, ExternalLink, EyeOff, File,
    Gamepad, HelpCircle, Home, Loader2, LogOut, Mail, MapPin, MessageCircle, MessageSquare, Moon, PanelLeft, Plus,
    PlusCircle, ScanFace, Search, Server, Settings, Share2, Shield, Sun, Trash, User, Workflow, X, Zap
} from 'lucide-react';

/**
 * @typedef {object} Icons
 * @property {LucideIcon} arrowRight - Arrow right icon.
 * @property {LucideIcon} award - Award icon.
 * @property {LucideIcon} book - Book icon.
 * @property {LucideIcon} check - Check icon.
 * @property {LucideIcon} chevronDown - Chevron down icon.
 * @property {LucideIcon} circle - Circle icon.
 * @property {LucideIcon} workflow - Workflow icon.
 * @property {LucideIcon} close - Close icon.
 * @property {LucideIcon} copy - Copy icon.
 * @property {LucideIcon} dark - Dark mode icon.
 * @property {LucideIcon} edit - Edit icon.
 * @property {LucideIcon} externalLink - External link icon.
 * @property {LucideIcon} eyeOff - Eye off icon (for Blind Exchange).
 * @property {LucideIcon} file - File icon.
 * @property {LucideIcon} help - Help icon.
 * @property {LucideIcon} home - Home icon.
 * @property {LucideIcon} light - Light mode icon.
 * @property {LucideIcon} loader - Loader icon.
 * @property {LucideIcon} logOut - Log out icon.
 * @property {LucideIcon} mail - Mail icon.
 * @property {LucideIcon} mapPin - Map pin icon.
 * @property {LucideIcon} messageCircle - Message circle icon (for Chat).
 * @property {LucideIcon} messageSquare - Message square icon.
 * @property {LucideIcon} plus - Plus icon.
 * @property {LucideIcon} plusCircle - Plus circle icon.
 * @property {LucideIcon} scanFace - Scan face icon (for Facial Analysis).
 * @property {LucideIcon} search - Search icon.
 * @property {LucideIcon} server - Server icon.
 * @property {LucideIcon} settings - Settings icon.
 * @property {LucideIcon} share - Share icon.
 * @property {LucideIcon} shield - Shield icon.
 * @property {LucideIcon} spinner - Spinner icon.
 * @property {LucideIcon} trash - Trash icon.
 * @property {LucideIcon} user - User icon.
 * @property {LucideIcon} panelLeft - Panel left icon.
 * @property {LucideIcon} gamepad - Gamepad icon.
 * @property {LucideIcon} zap - Zap icon (for Speed Dating).
 */
const Icons = {
  arrowRight: ArrowRight,
  award: Award, // Added award icon
  book: Book, // Added book icon
  check: Check,
  chevronDown: ChevronsUpDown,
  circle: Circle,
  workflow: Workflow,
  close: X,
  copy: Copy,
  dark: Moon,
  edit: Edit,
  externalLink: ExternalLink,
  eyeOff: EyeOff, // Added eyeOff icon
  file: File,
  help: HelpCircle,
  home: Home,
  light: Sun,
  loader: Loader2,
  logOut: LogOut,
  mail: Mail,
  mapPin: MapPin,
  messageCircle: MessageCircle,
  messageSquare: MessageSquare,
  plus: Plus,
  plusCircle: PlusCircle,
  scanFace: ScanFace, // Added scanFace icon
  search: Search,
  server: Server,
  settings: Settings,
  share: Share2,
  shield: Shield,
  spinner: Loader2,
  trash: Trash,
  user: User,
  panelLeft: PanelLeft,
  gamepad: Gamepad,
  zap: Zap,
};

export {Icons};
