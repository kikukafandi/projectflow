"use client";

import { Bell, LogOut, Menu, Search } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "@/lib/auth-client";
import { cn } from "@/lib/utils";
import { DesktopSidebar, MobileDrawer } from "./app-sidebar";
import { bottomNavHrefs, navItems } from "./nav";

export function AppShell({
  user,
  children,
}: {
  user: { name?: string | null; email?: string | null };
  children: React.ReactNode;
}) {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();

  const current = navItems.find(
    (i) => pathname === i.href || pathname.startsWith(i.href + "/"),
  );

  async function handleSignOut() {
    await signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <div className="flex min-h-screen">
      <DesktopSidebar />
      <MobileDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="flex min-w-0 flex-1 flex-col">
        {/* Top header (DESIGN.MD §11) */}
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-line bg-page/80 px-4 backdrop-blur md:px-6 lg:px-8">
          <button
            onClick={() => setDrawerOpen(true)}
            aria-label="Buka menu"
            className="flex size-10 items-center justify-center rounded-[10px] text-ink-secondary hover:bg-surface-muted lg:hidden"
          >
            <Menu className="size-5" />
          </button>
          <span className="text-sm font-medium text-ink lg:hidden">
            {current?.label ?? "ProjectFlow"}
          </span>

          <div className="ml-auto flex items-center gap-2">
            <div className="hidden items-center gap-2 rounded-[12px] border border-line bg-surface px-3 md:flex">
              <Search className="size-4 text-ink-muted" />
              <input
                placeholder="Cari…"
                className="h-[38px] w-40 bg-transparent text-sm outline-none placeholder:text-ink-muted lg:w-56"
              />
            </div>
            <button
              aria-label="Notifikasi"
              className="flex size-10 items-center justify-center rounded-[10px] text-ink-secondary hover:bg-surface-muted"
            >
              <Bell className="size-5" />
            </button>
            <div className="hidden items-center gap-2 rounded-full bg-surface py-1 pl-1 pr-3 md:flex">
              <span className="flex size-8 items-center justify-center rounded-full bg-primary text-[13px] font-semibold text-white">
                {(user.name ?? user.email ?? "?").charAt(0).toUpperCase()}
              </span>
              <span className="max-w-32 truncate text-[13px] font-medium text-ink">
                {user.name ?? user.email}
              </span>
            </div>
            <button
              onClick={handleSignOut}
              aria-label="Keluar"
              className="flex size-10 items-center justify-center rounded-[10px] text-ink-secondary hover:bg-danger-soft hover:text-danger"
            >
              <LogOut className="size-5" />
            </button>
          </div>
        </header>

        <div className="flex-1 px-4 py-4 pb-24 md:px-6 lg:px-8 lg:py-6 lg:pb-8">
          {children}
        </div>

        {/* Bottom nav (DESIGN.MD §30) */}
        <nav className="fixed inset-x-0 bottom-0 z-30 flex h-16 items-center justify-around border-t border-line bg-surface/95 backdrop-blur lg:hidden">
          {navItems
            .filter((i) => bottomNavHrefs.includes(i.href))
            .map((item) => {
              const active =
                pathname === item.href || pathname.startsWith(item.href + "/");
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex flex-col items-center gap-1 text-[11px] font-medium",
                    active ? "text-primary" : "text-ink-muted",
                  )}
                >
                  <item.icon className="size-5" strokeWidth={1.9} />
                  {item.label}
                </Link>
              );
            })}
        </nav>
      </main>
    </div>
  );
}
