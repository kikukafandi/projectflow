import { NextResponse } from "next/server";
import { timingSafeEqual } from "node:crypto";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { db } from "@/db";
import { clients } from "@/db/schema";

// node:crypto perlu runtime Node, bukan Edge.
export const runtime = "nodejs";

const payloadSchema = z.object({
  name: z.string().trim().min(2).max(160),
  companyName: z.string().trim().max(160).optional(),
  email: z.string().trim().email().optional(),
  whatsapp: z.string().trim().max(40).optional(),
  notes: z.string().trim().max(4000).optional(),
  source: z.string().trim().max(120).optional(),
});

/** Bandingkan secret tahan-timing. Gagal-tertutup bila env atau header kosong. */
function secretMatches(received: string | null) {
  const expected = process.env.INTAKE_SECRET;
  if (!expected || !received) return false;
  const a = Buffer.from(received);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}

export async function POST(request: Request) {
  if (!secretMatches(request.headers.get("x-intake-secret"))) {
    return NextResponse.json({ error: "Tidak diizinkan." }, { status: 401 });
  }

  const parsed = payloadSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "Data tidak lengkap." }, { status: 422 });
  }
  const data = parsed.data;

  // Cegah duplikat berdasarkan email agar daftar klien tidak kotor.
  if (data.email) {
    const existing = await db
      .select({ id: clients.id })
      .from(clients)
      .where(eq(clients.email, data.email))
      .limit(1);
    if (existing.length > 0) {
      return NextResponse.json({ ok: true, created: false, clientId: existing[0].id });
    }
  }

  const notes = [data.source && `Sumber: ${data.source}`, data.notes]
    .filter(Boolean)
    .join("\n\n");

  const [created] = await db
    .insert(clients)
    .values({
      type: data.companyName ? "perusahaan" : "individu",
      name: data.name,
      companyName: data.companyName ?? null,
      email: data.email ?? null,
      whatsapp: data.whatsapp ?? null,
      notes: notes || null,
    })
    .returning({ id: clients.id });

  return NextResponse.json({ ok: true, created: true, clientId: created.id }, { status: 201 });
}
