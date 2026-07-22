"use server";

import { revalidatePath } from "next/cache";
import { requireUser } from "@/lib/session";
import {
  markAllNotificationsRead,
  markNotificationRead,
} from "@/lib/notifications";

export async function readNotification(id: string): Promise<void> {
  await requireUser();
  await markNotificationRead(id);
  revalidatePath("/notifications");
}

export async function readAllNotifications(): Promise<void> {
  await requireUser();
  await markAllNotificationsRead();
  revalidatePath("/notifications");
}
