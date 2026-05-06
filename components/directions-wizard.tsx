"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { buildPlan, levelOptions, type Direction, type Level, type RoleTech } from "@/lib/data";
import { Badge, ProgressBar } from "@/components/ui";

const urgencyOptions = ["Уже скоро - покажи самое важное", "Через 1-2 недели", "Через месяц и более"];

export function DirectionsWizard({ directions, roleTech }: { directions: Direction[]; roleTech: RoleTech[] }) {
  const roles = roleTech.map((item) => item.role);
  const technologiesByRole = Object.fromEntries(roleTech.map((item) => [item.role, item.technologies]));
  const [step, setStep] = useState(0);
  const [role, setRole] = useState(roles[0]);
  const [technologies, setTechnologies] = useState<string[]>(["JavaScript", "React"]);
  const [level, setLevel] = useState<Level>("Junior");
  const [urgency, setUrgency] = useState(urgencyOptions[0]);
  const [message, setMessage] = useState("");

  const availableTech = technologiesByRole[role] ?? [];
  const plan = useMemo(() => buildPlan(role, technologies, level, urgency, directions), [role, technologies, level, urgency, directions]);

  function toggleTech(tech: string) {
    setTechnologies((current) => (current.includes(tech) ? current.filter((item) => item !== tech) : [...current, tech]));
  }

  async function saveCurrentPlan() {
    const response = await fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role, level, urgency, technologies, plan })
    });

    setMessage(response.ok ? "План сохранён в профиле" : "Войдите, чтобы сохранить план");
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Badge>4 шага</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Выбор направления подготовки</h1>
        <p className="mt-3 text-muted-foreground">Мастер собирает роль, стек, уровень и дедлайн, затем строит персональный план.</p>
      </div>
      <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
        <ProgressBar value={(step + 1) * 25} label={`Шаг ${step + 1} из 4`} />

        <div className="mt-8 min-h-[280px]">
          {step === 0 ? (
            <OptionGrid title="Роль" items={roles} selected={[role]} onSelect={(item) => setRole(item)} />
          ) : null}
          {step === 1 ? (
            <OptionGrid title="Технологии" items={availableTech} selected={technologies} onSelect={toggleTech} multi />
          ) : null}
          {step === 2 ? (
            <OptionGrid title="Уровень" items={levelOptions.map((item) => `${item}${item === "Junior" ? " (0-1 год)" : item === "Middle" ? " (1-3 года)" : " (3+ лет)"}`)} selected={[level]} onSelect={(item) => setLevel(item.split(" ")[0] as Level)} />
          ) : null}
          {step === 3 ? (
            <OptionGrid title="Когда собеседование?" items={urgencyOptions} selected={[urgency]} onSelect={setUrgency} />
          ) : null}
        </div>

        <div className="flex justify-between gap-3 border-t border-border pt-5">
          <button disabled={step === 0} onClick={() => setStep((value) => Math.max(0, value - 1))} className="rounded-md border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40">
            Назад
          </button>
          <button onClick={() => setStep((value) => Math.min(3, value + 1))} className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground">
            {step === 3 ? "Обновить план" : "Далее"}
          </button>
        </div>
      </div>

      <section className="mt-8 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">Персональный план</h2>
            <p className="text-sm text-muted-foreground">{role}, {level}, {urgency.toLowerCase()}</p>
          </div>
          <button onClick={saveCurrentPlan} className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary">Сохранить план</button>
        </div>
        {message ? <p className="mb-4 rounded-md bg-muted px-3 py-2 text-sm text-muted-foreground">{message}</p> : null}
        <div className="grid gap-3">
          {plan.map((item) => (
            <article key={`${item.title}-${item.priority}`} className="flex flex-col gap-3 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <Badge>Приоритет {item.priority}</Badge>
                <h3 className="mt-2 font-display text-lg font-bold">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.focus} • {item.duration}</p>
              </div>
              <div className="flex gap-2">
                <Link href={`/questions/${item.slug}`} className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground">Вопросы</Link>
                <Link href={`/quiz/${item.slug}`} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">Мини-тест</Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}

function OptionGrid({ title, items, selected, onSelect, multi = false }: { title: string; items: string[]; selected: string[]; onSelect: (item: string) => void; multi?: boolean }) {
  return (
    <div>
      <h2 className="mb-4 font-display text-2xl font-bold">{title}</h2>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const active = selected.some((value) => item.startsWith(value));
          return (
            <button key={item} onClick={() => onSelect(item)} className={`min-h-20 rounded-lg border p-4 text-left font-semibold transition ${active ? "border-primary bg-primary text-primary-foreground" : "border-border bg-background hover:border-primary"}`}>
              <span className="block">{item}</span>
              {multi ? <span className="mt-2 block text-xs opacity-75">{active ? "Выбрано" : "Добавить в план"}</span> : null}
            </button>
          );
        })}
      </div>
    </div>
  );
}
