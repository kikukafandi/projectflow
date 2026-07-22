import {
  Boxes,
  CalendarCheck,
  FileText,
  History,
  LayoutDashboard,
  ListChecks,
  Receipt,
  Settings,
  Users,
  Wallet,
  FolderKanban,
  FileSpreadsheet,
  type LucideIcon,
} from "lucide-react";

export type NavItem = {
  label: string;
  href: string;
  icon: LucideIcon;
  enabled: boolean;
};

/** Sidebar nav (DESIGN.MD §10). Unbuilt modules are shown disabled for structure. */
export const navItems: NavItem[] = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard, enabled: true },
  { label: "Clients", href: "/clients", icon: Users, enabled: true },
  { label: "Projects", href: "/projects", icon: FolderKanban, enabled: true },
  { label: "Daily Focus", href: "/focus", icon: CalendarCheck, enabled: true },
  { label: "Feature Library", href: "/library", icon: Boxes, enabled: true },
  { label: "RAB & Quotations", href: "/sales", icon: FileSpreadsheet, enabled: false },
  { label: "Tasks", href: "/tasks", icon: ListChecks, enabled: false },
  { label: "Invoices", href: "/invoices", icon: FileText, enabled: true },
  { label: "Payments", href: "/payments", icon: Wallet, enabled: true },
  { label: "Documents", href: "/documents", icon: Receipt, enabled: false },
  { label: "Activity Log", href: "/activity", icon: History, enabled: true },
  { label: "Settings", href: "/settings", icon: Settings, enabled: true },
];

/** Mobile bottom-nav subset (DESIGN.MD §30). */
export const bottomNavHrefs = ["/dashboard", "/projects", "/clients", "/settings"];
