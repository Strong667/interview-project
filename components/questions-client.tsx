"use client";

import { useEffect, useMemo, useState } from "react";
import type { Direction, InterviewQuestion, Level, QuestionType } from "@/lib/data";
import { usePrepStore } from "@/lib/store";
import { Badge, ProgressBar } from "@/components/ui";

const levels: Level[] = ["Junior", "Middle", "Senior"];
const types: { value: QuestionType; label: string }[] = [
  { value: "theory", label: "Теория" },
  { value: "practice", label: "Практика" },
  { value: "code", label: "Код" }
];

export function QuestionsClient({
  direction,
  questions,
  initialSaved,
  initialKnown,
  isAuthenticated
}: {
  direction: Direction;
  questions: InterviewQuestion[];
  initialSaved: string[];
  initialKnown: string[];
  isAuthenticated: boolean;
}) {
  const { saved, known, toggleSaved, markKnown, setSaved, setKnown } = usePrepStore();
  const [query, setQuery] = useState("");
  const [level, setLevel] = useState<Level | "all">("all");
  const [type, setType] = useState<QuestionType | "all">("all");
  const [subtopic, setSubtopic] = useState("all");
  const [open, setOpen] = useState<string | null>(questions[0]?.id ?? null);
  const [toast, setToast] = useState("");
  const [preview, setPreview] = useState<InterviewQuestion | null>(null);

  const subtopics = [...new Set(questions.map((item) => item.subtopic))];
  useEffect(() => {
    setSaved(initialSaved);
    setKnown(initialKnown);
  }, [initialKnown, initialSaved, setKnown, setSaved]);

  const filtered = useMemo(
    () =>
      questions.filter((item) => {
        const text = `${item.question} ${item.answer} ${item.tags.join(" ")}`.toLowerCase();
        return (
          text.includes(query.toLowerCase()) &&
          (level === "all" || item.level === level) &&
          (type === "all" || item.type === type) &&
          (subtopic === "all" || item.subtopic === subtopic)
        );
      }),
    [questions, query, level, type, subtopic]
  );
  const progress = questions.length ? Math.round((known.length / questions.length) * 100) : 0;

  function notify(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 1600);
  }

  async function saveQuestion(item: InterviewQuestion) {
    if (!isAuthenticated) {
      notify("Войдите, чтобы сохранить вопрос");
      return;
    }

    const nextSaved = !saved.includes(item.id);
    toggleSaved(item.id);
    const response = await fetch("/api/saved", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: item.id, saved: nextSaved })
    });

    if (!response.ok) {
      toggleSaved(item.id);
      notify("Не удалось сохранить");
      return;
    }

    notify(nextSaved ? "Сохранено" : "Удалено из закладок");
  }

  async function saveProgress(item: InterviewQuestion, knownStatus: boolean) {
    if (!isAuthenticated) {
      notify("Войдите, чтобы сохранить прогресс");
      return;
    }

    markKnown(item.id, knownStatus);
    const response = await fetch("/api/progress", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ questionId: item.id, status: knownStatus ? "known" : "unknown" })
    });

    if (!response.ok) notify("Не удалось сохранить прогресс");
  }

  return (
    <div className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Badge>{direction.title}</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Вопросы по теме {direction.title}</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">{direction.description}</p>
      </div>

      <div className="grid gap-6 lg:grid-cols-[280px_1fr]">
        <aside className="sticky top-20 h-fit rounded-lg border border-border bg-card p-4 shadow-sm max-lg:static">
          <h2 className="mb-4 font-bold">Фильтры</h2>
          <div className="space-y-5">
            <label className="block text-sm font-semibold">
              Поиск
              <input value={query} onChange={(event) => setQuery(event.target.value)} className="focus-ring mt-2 w-full rounded-md border border-border bg-background px-3 py-2 text-sm" placeholder="Event Loop, hooks..." />
            </label>
            <div>
              <p className="mb-2 text-sm font-semibold">Подтемы</p>
              <div className="grid gap-2">
                {["all", ...subtopics].map((item) => (
                  <button key={item} onClick={() => setSubtopic(item)} className={`rounded-md px-3 py-2 text-left text-sm transition ${subtopic === item ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:text-foreground"}`}>
                    {item === "all" ? "Все подтемы" : item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Уровень</p>
              <div className="flex flex-wrap gap-2">
                {["all", ...levels].map((item) => (
                  <button key={item} onClick={() => setLevel(item as Level | "all")} className={`rounded-md border px-3 py-2 text-sm ${level === item ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                    {item === "all" ? "Все" : item}
                  </button>
                ))}
              </div>
            </div>
            <div>
              <p className="mb-2 text-sm font-semibold">Тип</p>
              <div className="grid grid-cols-2 gap-2">
                {[{ value: "all", label: "Все" }, ...types].map((item) => (
                  <button key={item.value} onClick={() => setType(item.value as QuestionType | "all")} className={`rounded-md border px-3 py-2 text-sm ${type === item.value ? "border-primary bg-primary text-primary-foreground" : "border-border"}`}>
                    {item.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </aside>

        <main className="space-y-4">
          <div className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <ProgressBar value={progress} label={`Пройдено ${known.length} из ${questions.length}`} />
          </div>

          {filtered.map((item) => {
            const isOpen = open === item.id;
            return (
              <article key={item.id} className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
                <button onClick={() => setOpen(isOpen ? null : item.id)} className="flex w-full items-start justify-between gap-4 p-5 text-left">
                  <span>
                    <span className="mb-3 flex flex-wrap gap-2">
                      <Badge tone={item.level === "Senior" ? "warning" : "default"}>{item.level}</Badge>
                      <Badge>{item.subtopic}</Badge>
                      <Badge>{item.type}</Badge>
                    </span>
                    <span className="font-display text-lg font-bold">{item.question}</span>
                  </span>
                  <span className="text-xl">{isOpen ? "-" : "+"}</span>
                </button>
                {isOpen ? (
                  <div className="border-t border-border p-5 pt-4">
                    <p className="leading-7 text-muted-foreground">{item.answer}</p>
                    {item.code ? <pre className="code-block mt-4"><code>{item.code}</code></pre> : null}
                    <div className="mt-5 flex flex-wrap gap-2">
                      <button onClick={() => saveQuestion(item)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">
                        {saved.includes(item.id) ? "В закладках" : "Сохранить"}
                      </button>
                      <button onClick={() => saveProgress(item, true)} className="rounded-md bg-emerald-600 px-4 py-2 text-sm font-semibold text-white">Знаю</button>
                      <button onClick={() => saveProgress(item, false)} className="rounded-md bg-muted px-4 py-2 text-sm font-semibold">Не знаю</button>
                      <button onClick={() => setPreview(item)} className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary">Быстрый просмотр</button>
                    </div>
                  </div>
                ) : null}
              </article>
            );
          })}
        </main>
      </div>

      {toast ? <div className="fixed bottom-5 right-5 rounded-md bg-foreground px-4 py-3 text-sm font-semibold text-background shadow-soft">{toast}</div> : null}
      {preview ? (
        <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4" onClick={() => setPreview(null)}>
          <div className="max-w-2xl rounded-lg border border-border bg-card p-6 shadow-soft" onClick={(event) => event.stopPropagation()}>
            <div className="mb-3 flex justify-between gap-4">
              <h3 className="font-display text-xl font-bold">{preview.question}</h3>
              <button onClick={() => setPreview(null)} className="h-8 w-8 rounded-md border border-border">x</button>
            </div>
            <p className="leading-7 text-muted-foreground">{preview.answer}</p>
          </div>
        </div>
      ) : null}
    </div>
  );
}
