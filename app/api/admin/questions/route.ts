import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { addQuestion } from "@/lib/user-db";
import type { Level, QuestionType } from "@/lib/data";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9а-яё]+/gi, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export async function POST(request: Request) {
  try {
    await requireAdmin();
    const body = (await request.json()) as {
      topic?: string;
      subtopic?: string;
      level?: Level;
      type?: QuestionType;
      tags?: string;
      question?: string;
      answer?: string;
      code?: string;
    };

    const topic = body.topic?.trim();
    const subtopic = body.subtopic?.trim();
    const question = body.question?.trim();
    const answer = body.answer?.trim();
    const level = body.level;
    const type = body.type;

    if (!topic || !subtopic || !question || !answer || !level || !type) {
      return NextResponse.json({ error: "Заполните тему, подтему, уровень, тип, вопрос и ответ." }, { status: 400 });
    }

    const id = `${topic}-${slugify(subtopic)}-${slugify(question).slice(0, 36)}`;
    addQuestion({
      id,
      topic,
      subtopic,
      level,
      type,
      tags: (body.tags ?? "")
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      question,
      answer,
      code: body.code?.trim() || null
    });

    return NextResponse.json({ ok: true, id });
  } catch (error) {
    if (error instanceof Error && error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Доступ только для администратора." }, { status: 403 });
    }
    if (error instanceof Error && error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Нужно войти в аккаунт администратора." }, { status: 401 });
    }
    if (error instanceof Error && error.message === "UNKNOWN_TOPIC") {
      return NextResponse.json({ error: "Такого направления нет." }, { status: 400 });
    }
    if (error instanceof Error && error.message === "DUPLICATE_QUESTION") {
      return NextResponse.json({ error: "Такой вопрос уже существует." }, { status: 409 });
    }

    return NextResponse.json({ error: "Не удалось добавить вопрос." }, { status: 500 });
  }
}
