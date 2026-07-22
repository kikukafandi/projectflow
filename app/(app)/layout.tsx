import { AppShell } from "@/components/app-shell";
import { unreadCount } from "@/lib/notifications";
import { requireUser } from "@/lib/session";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await requireUser();
  const unread = await unreadCount();
  return (
    <AppShell user={user} unreadCount={unread}>
      {children}
    </AppShell>
  );
}
