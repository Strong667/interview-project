import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { setSavedQuestion } from "@/lib/user-db";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as { questionId?: string; saved?: boolean };
    if (!body.questionId) return NextResponse.json({ error: "questionId is required" }, { status: 400 });
    setSavedQuestion(user.id, body.questionId, Boolean(body.saved));
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }
}
