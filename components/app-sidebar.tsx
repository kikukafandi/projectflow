"use client";

import { Workflow, X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { navItems } from "./nav";

function NavLinks({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  return (
    <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3">
      {navItems.map((item) => {
        const active =
          pathname === item.href || pathname.startsWith(item.href + "/");
        if (!item.enabled) {
          return (
            <span
              key={item.href}
              className="flex h-[44px] cursor-not-allowed items-center gap-3 rounded-[12px] px-3 text-sm font-medium text-sidebar-muted/60"
              title="Segera hadir"
            >
              <item.icon className="size-[19px]" strokeWidth={1.9} />
              {item.label}
              <span className="ml-auto rounded-full bg-sidebar-surface px-2 py-0.5 text-[10px] text-sidebar-muted">
                soon
              </span>
            </span>
          );
        }
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            aria-current={active ? "page" : undefined}
            className={cn(
              "relative flex h-[44px] items-center gap-3 rounded-[12px] px-3 text-sm font-medium transition-colors",
              active
                ? "bg-sidebar-active text-white"
                : "text-sidebar-muted hover:bg-sidebar-surface hover:text-sidebar-text",
            )}
          >
            {active && (
              <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-full bg-primary" />
            )}
            <item.icon className="size-[19px]" strokeWidth={1.9} />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function Brand() {
  return (
    <div className="flex items-center gap-2.5 px-5 py-5">
      <span className="flex size-9 items-center justify-center rounded-[12px] bg-primary text-white">
        <Workflow className="size-5" />
      </span>
      <span className="text-[17px] font-semibold text-sidebar-text">
        ProjectFlow
      </span>
    </div>
  );
}

/** Desktop dark rounded sidebar (DESIGN.MD §10). */
export function DesktopSidebar() {
  return (
    <aside className="hidden lg:sticky lg:top-0 lg:flex lg:h-screen lg:w-[248px] lg:shrink-0 lg:p-3">
      <div className="flex min-h-0 w-full flex-col rounded-[24px] bg-sidebar-bg pb-4">
        <Brand />
        <NavLinks />
      </div>
    </aside>
  );
}

/** Mobile drawer (DESIGN.MD §9 mobile). */
export function MobileDrawer({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <div
      className={cn(
        "fixed inset-0 z-50 lg:hidden",
        open ? "pointer-events-auto" : "pointer-events-none",
      )}
      aria-hidden={!open}
    >
      <div
        className={cn(
          "absolute inset-0 bg-black/40 transition-opacity duration-200",
          open ? "opacity-100" : "opacity-0",
        )}
        onClick={onClose}
      />
      <div
        className={cn(
          "absolute left-0 top-0 flex h-full w-[264px] flex-col bg-sidebar-bg transition-transform duration-200",
          open ? "translate-x-0" : "-translate-x-full",
        )}
        role="dialog"
        aria-label="Menu navigasi"
      >
        <div className="flex items-center justify-between pr-3">
          <Brand />
          <button
            onClick={onClose}
            aria-label="Tutup menu"
            className="flex size-9 items-center justify-center rounded-[10px] text-sidebar-muted hover:bg-sidebar-surface"
          >
            <X className="size-5" />
          </button>
        </div>
        <NavLinks onNavigate={onClose} />
      </div>
    </div>
  );
}
