import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { updateUserProfile } from "@/lib/user-db";

export async function PUT(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as { name?: string; role?: string; stack?: string; level?: string };
    const updated = updateUserProfile(user.id, {
      name: body.name?.trim() || user.name,
      role: body.role?.trim() || "",
      stack: body.stack?.trim() || "",
      level: body.level?.trim() || ""
    });

    return NextResponse.json({ user: updated });
  } catch {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }
}
