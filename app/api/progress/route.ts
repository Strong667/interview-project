import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { setQuestionProgress } from "@/lib/user-db";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as { questionId?: string; status?: "known" | "unknown" };
    if (!body.questionId || !body.status) return NextResponse.json({ error: "questionId and status are required" }, { status: 400 });
    setQuestionProgress(user.id, body.questionId, body.status);
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }
}
