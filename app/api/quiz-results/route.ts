import { NextResponse } from "next/server";
import { requireUser } from "@/lib/auth";
import { saveQuizResult } from "@/lib/user-db";

export async function POST(request: Request) {
  try {
    const user = await requireUser();
    const body = (await request.json()) as { topic?: string; score?: number; total?: number; weakTopics?: string[] };
    if (!body.topic || typeof body.score !== "number" || typeof body.total !== "number") {
      return NextResponse.json({ error: "Некорректный результат." }, { status: 400 });
    }

    saveQuizResult(user.id, {
      topic: body.topic,
      score: body.score,
      total: body.total,
      weakTopics: body.weakTopics ?? []
    });

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Нужно войти в аккаунт." }, { status: 401 });
  }
}
