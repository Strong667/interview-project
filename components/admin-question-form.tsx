"use client";

import { useState } from "react";
import type { Direction, Level, QuestionType } from "@/lib/data";

const levels: Level[] = ["Junior", "Middle", "Senior"];
const types: { value: QuestionType; label: string }[] = [
  { value: "theory", label: "Теория" },
  { value: "practice", label: "Практика" },
  { value: "code", label: "Код" }
];

export function AdminQuestionForm({ directions }: { directions: Direction[] }) {
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setMessage("");
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/admin/questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        topic: form.get("topic"),
        subtopic: form.get("subtopic"),
        level: form.get("level"),
        type: form.get("type"),
        tags: form.get("tags"),
        question: form.get("question"),
        answer: form.get("answer"),
        code: form.get("code")
      })
    });

    const data = (await response.json()) as { id?: string; error?: string };
    if (!response.ok) {
      setError(data.error ?? "Не удалось добавить вопрос.");
      return;
    }

    event.currentTarget.reset();
    setMessage(`Вопрос добавлен: ${data.id}`);
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <div className="grid gap-4 md:grid-cols-2">
        <label className="grid gap-2 text-sm font-semibold">
          Направление
          <select name="topic" required className="focus-ring rounded-md border border-border bg-background px-3 py-2">
            {directions.map((direction) => (
              <option key={direction.slug} value={direction.slug}>
                {direction.title}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Подтема
          <input name="subtopic" required className="focus-ring rounded-md border border-border bg-background px-3 py-2" placeholder="Event Loop" />
        </label>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <label className="grid gap-2 text-sm font-semibold">
          Уровень
          <select name="level" required className="focus-ring rounded-md border border-border bg-background px-3 py-2">
            {levels.map((level) => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Тип
          <select name="type" required className="focus-ring rounded-md border border-border bg-background px-3 py-2">
            {types.map((type) => (
              <option key={type.value} value={type.value}>{type.label}</option>
            ))}
          </select>
        </label>
        <label className="grid gap-2 text-sm font-semibold">
          Теги
          <input name="tags" className="focus-ring rounded-md border border-border bg-background px-3 py-2" placeholder="async, runtime" />
        </label>
      </div>

      <label className="grid gap-2 text-sm font-semibold">
        Вопрос
        <textarea name="question" required className="focus-ring min-h-24 rounded-md border border-border bg-background px-3 py-2" placeholder="Что такое..." />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Ответ
        <textarea name="answer" required className="focus-ring min-h-36 rounded-md border border-border bg-background px-3 py-2" placeholder="Краткий, проверяемый ответ..." />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Код
        <textarea name="code" className="focus-ring min-h-32 rounded-md border border-border bg-background px-3 py-2 font-mono text-sm" placeholder="Опционально" />
      </label>

      {message ? <p className="rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-300">{message}</p> : null}
      {error ? <p className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
      <button className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Добавить вопрос</button>
    </form>
  );
}
