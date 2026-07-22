import { desc, isNull } from "drizzle-orm";
import { Bell, Check } from "lucide-react";
import Link from "next/link";
import { db } from "@/db";
import { notifications } from "@/db/schema";
import { EmptyState } from "@/components/empty-state";
import { PageHeader } from "@/components/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  notificationUrgency,
  resolveNotificationHrefs,
  syncNotifications,
} from "@/lib/notifications";
import { formatDate } from "@/lib/utils";
import { readAllNotifications, readNotification } from "./actions";

export const dynamic = "force-dynamic";

export default async function NotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ all?: string }>;
}) {
  const { all } = await searchParams;
  const showAll = all === "1";

  await syncNotifications();

  const rows = await db
    .select()
    .from(notifications)
    .where(showAll ? undefined : isNull(notifications.readAt))
    .orderBy(desc(notifications.createdAt))
    .limit(100);
  const hrefs = await resolveNotificationHrefs(rows);

  return (
    <>
      <PageHeader
        title="Notifikasi"
        description="Pengingat deadline, WIP limit, quotation, dan tagihan."
        actions={
          <>
            <Button asChild variant="secondary">
              <Link href={showAll ? "/notifications" : "/notifications?all=1"}>
                {showAll ? "Belum dibaca" : "Semua"}
              </Link>
            </Button>
            <form action={readAllNotifications}>
              <Button type="submit" variant="ghost">
                <Check /> Tandai semua
              </Button>
            </form>
          </>
        }
      />

      {rows.length === 0 ? (
        <EmptyState
          icon={Bell}
          title={showAll ? "Belum ada notifikasi" : "Semua sudah dibaca"}
          description="Notifikasi muncul otomatis dari deadline task, WIP limit, quotation, dan invoice."
        />
      ) : (
        <ul className="space-y-2">
          {rows.map((n) => {
            const urgency = notificationUrgency[n.urgency] ?? notificationUrgency.low;
            const href = hrefs[n.id];
            return (
              <li key={n.id}>
                <Card className={n.readAt ? "opacity-60" : undefined}>
                  <CardContent className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-medium text-ink">
                          {href ? (
                            <Link href={href} className="hover:text-primary">
                              {n.title}
                            </Link>
                          ) : (
                            n.title
                          )}
                        </span>
                        <Badge tone={urgency.tone}>{urgency.label}</Badge>
                      </div>
                      {n.body && (
                        <p className="mt-0.5 text-[13px] text-ink-secondary">{n.body}</p>
                      )}
                      <p className="mt-0.5 text-[12px] text-ink-muted">
                        {formatDate(n.createdAt)}
                      </p>
                    </div>
                    {!n.readAt && (
                      <form action={readNotification.bind(null, n.id)} className="shrink-0">
                        <Button type="submit" size="sm" variant="secondary">
                          <Check className="size-4" /> Tandai dibaca
                        </Button>
                      </form>
                    )}
                  </CardContent>
                </Card>
              </li>
            );
          })}
        </ul>
      )}
    </>
  );
}
