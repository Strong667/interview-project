import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { savePlan } from "@/lib/user-db";
import type { PlanItem } from "@/lib/data";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as { role?: string; level?: string; urgency?: string; technologies?: string[]; plan?: PlanItem[] };
    if (!body.role || !body.level || !body.urgency || !body.technologies || !body.plan) {
      return NextResponse.json({ error: "Некорректный план." }, { status: 400 });
    }

    savePlan(user.id, {
      role: body.role,
      level: body.level,
      urgency: body.urgency,
      technologies: body.technologies,
      plan: body.plan
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }
}
