"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import type { Direction, InterviewQuestion } from "@/lib/data";
import { Badge, ProgressBar } from "@/components/ui";

export function QuizClient({ topic, direction, questions, isAuthenticated }: { topic: string; direction: Direction; questions: InterviewQuestion[]; isAuthenticated: boolean }) {
  const [index, setIndex] = useState(0);
  const [mode, setMode] = useState<"cards" | "choice">("cards");
  const [showAnswer, setShowAnswer] = useState(false);
  const [score, setScore] = useState(0);
  const [answered, setAnswered] = useState(false);
  const [missedTopics, setMissedTopics] = useState<string[]>([]);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const current = questions[index % questions.length];
  const done = index >= Math.min(questions.length, 6);
  const options = useMemo(() => {
    const wrong = questions.filter((item) => item.id !== current.id).slice(0, 3).map((item) => item.subtopic);
    return [current.subtopic, ...wrong].sort();
  }, [current, questions]);
  const savedResultRef = useRef(false);

  useEffect(() => {
    if (!done || !isAuthenticated || savedResultRef.current) return;
    savedResultRef.current = true;
    setSaveStatus("saving");
    const total = Math.min(questions.length, 6);
    const weakTopics = [...new Set(missedTopics)].slice(0, 3);

    fetch("/api/quiz-results", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topic, score, total, weakTopics })
    }).then((response) => setSaveStatus(response.ok ? "saved" : "error")).catch(() => setSaveStatus("error"));
  }, [done, isAuthenticated, missedTopics, questions, score, topic]);

  function next(known: boolean, countScore = true) {
    if (known) setScore((value) => value + 1);
    if (!known && countScore) setMissedTopics((topics) => [...topics, current.subtopic]);
    setShowAnswer(false);
    setAnswered(false);
    setIndex((value) => value + 1);
  }

  if (done) {
    const total = Math.min(questions.length, 6);
    const weak = [...new Set(missedTopics)].slice(0, 3);
    return (
      <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <section className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <Badge>Итог</Badge>
          <h1 className="mt-4 font-display text-4xl font-bold">Результат {score} из {total}</h1>
          <p className="mt-3 text-muted-foreground">Слабые темы: {weak.join(", ") || "повторение базовых вопросов"}.</p>
          {isAuthenticated ? (
            <p className="mt-3 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">
              {saveStatus === "saving" ? "Сохраняем результат..." : saveStatus === "saved" ? "Результат сохранен в профиле." : saveStatus === "error" ? "Не удалось сохранить результат." : ""}
            </p>
          ) : null}
          <div className="mt-6 flex justify-center gap-3">
            <button onClick={() => { savedResultRef.current = false; setIndex(0); setScore(0); setMissedTopics([]); setSaveStatus("idle"); }} className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Повторить</button>
            <Link href={`/questions/${topic}`} className="rounded-md border border-border px-5 py-2 font-semibold">К вопросам</Link>
          </div>
        </section>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>{direction.title}</Badge>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Мини-тест</h1>
        </div>
        <div className="flex rounded-md border border-border bg-card p-1">
          <button onClick={() => setMode("cards")} className={`rounded px-3 py-2 text-sm font-semibold ${mode === "cards" ? "bg-primary text-primary-foreground" : ""}`}>Карточки</button>
          <button onClick={() => setMode("choice")} className={`rounded px-3 py-2 text-sm font-semibold ${mode === "choice" ? "bg-primary text-primary-foreground" : ""}`}>Выбор</button>
        </div>
      </div>
      <div className="mb-5 rounded-lg border border-border bg-card p-4">
        <ProgressBar value={Math.round((index / Math.min(questions.length, 6)) * 100)} label={`Вопрос ${index + 1}`} />
      </div>
      <section className="rounded-lg border border-border bg-card p-6 shadow-sm sm:p-8">
        <div className="mb-4 flex flex-wrap gap-2">
          <Badge>{current.level}</Badge>
          <Badge>{current.subtopic}</Badge>
        </div>
        <h2 className="font-display text-2xl font-bold">{current.question}</h2>
        {mode === "cards" ? (
          <div className="mt-6">
            {showAnswer ? <p className="rounded-lg bg-muted p-4 leading-7 text-muted-foreground">{current.answer}</p> : null}
            <div className="mt-6 flex flex-wrap gap-3">
              <button onClick={() => setShowAnswer(true)} className="rounded-md border border-border px-4 py-2 font-semibold">Показать ответ</button>
              <button onClick={() => next(true)} className="rounded-md bg-emerald-600 px-4 py-2 font-semibold text-white">Знал</button>
              <button onClick={() => next(false)} className="rounded-md bg-muted px-4 py-2 font-semibold">Не знал</button>
            </div>
          </div>
        ) : (
          <div className="mt-6 grid gap-3">
            {options.map((option) => (
              <button
                key={option}
                disabled={answered}
                onClick={() => {
                  setAnswered(true);
                  if (option === current.subtopic) {
                    setScore((value) => value + 1);
                  } else {
                    setMissedTopics((topics) => [...topics, current.subtopic]);
                  }
                }}
                className={`rounded-lg border border-border p-4 text-left font-semibold ${answered && option === current.subtopic ? "border-emerald-500 bg-emerald-500/10" : ""}`}
              >
                {option}
              </button>
            ))}
            {answered ? (
              <div className="mt-3">
                <p className="mb-3 text-sm text-muted-foreground">{current.answer}</p>
                <button onClick={() => next(false, false)} className="rounded-md bg-primary px-4 py-2 font-semibold text-primary-foreground">Дальше</button>
              </div>
            ) : null}
          </div>
        )}
      </section>
    </div>
  );
}
