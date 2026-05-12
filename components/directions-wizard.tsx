"use client";

import { useMemo, useRef, useState } from "react";
import Link from "next/link";
import { buildPlan, levelOptions, type Direction, type Level, type PlanItem, type RoleTech, type Urgency } from "@/lib/data";
import { Badge, ProgressBar } from "@/components/ui";

const urgencyLabels: Record<Urgency, string> = {
  urgent: "Уже скоро - покажи самое важное",
  normal: "Через 1-2 недели",
  relaxed: "Через месяц и более"
};
const urgencyOptions = Object.entries(urgencyLabels).map(([value, label]) => ({ value: value as Urgency, label }));

type PlanSelection = {
  role: string;
  level: Level;
  urgency: Urgency;
  technologies: string[];
};

export function DirectionsWizard({ directions, roleTech }: { directions: Direction[]; roleTech: RoleTech[] }) {
  const roles = roleTech.map((item) => item.role);
  const technologiesByRole = Object.fromEntries(roleTech.map((item) => [item.role, item.technologies]));
  const initialRole = roles[0] ?? "";
  const initialTechnologies = (technologiesByRole[initialRole] ?? ["JavaScript", "React"]).slice(0, 2);

  const [step, setStep] = useState(0);
  const [role, setRole] = useState(initialRole);
  const [technologies, setTechnologies] = useState<string[]>(initialTechnologies);
  const [level, setLevel] = useState<Level>("Junior");
  const [urgency, setUrgency] = useState<Urgency>("urgent");
  const [message, setMessage] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [isWizardOpen, setIsWizardOpen] = useState(true);
  const planRef = useRef<HTMLElement>(null);

  const availableTech = technologiesByRole[role] ?? [];
  const draftPlan = useMemo(() => buildPlan(role, technologies, level, urgency, directions), [role, technologies, level, urgency, directions]);
  const initialSelection = { role: initialRole, level: "Junior" as Level, urgency: "urgent" as Urgency, technologies: initialTechnologies };
  const [plan, setPlan] = useState<PlanItem[]>(() => buildPlan(initialSelection.role, initialSelection.technologies, initialSelection.level, initialSelection.urgency, directions));
  const [planSelection, setPlanSelection] = useState<PlanSelection>(initialSelection);

  function toggleTech(tech: string) {
    setTechnologies((current) => (current.includes(tech) ? current.filter((item) => item !== tech) : [...current, tech]));
  }

  function selectRole(nextRole: string) {
    setRole(nextRole);
    setTechnologies((technologiesByRole[nextRole] ?? []).slice(0, 2));
    setMessage("");
  }

  async function persistPlan(selection: PlanSelection, planItems: PlanItem[]) {
    return fetch("/api/plans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...selection, plan: planItems })
    });
  }

  async function updateCurrentPlan() {
    if (!technologies.length) {
      setMessage("Выберите хотя бы одну технологию, чтобы обновить план.");
      return;
    }

    const nextSelection = { role, level, urgency, technologies };
    const nextPlan = draftPlan;

    setIsSaving(true);
    setPlan(nextPlan);
    setPlanSelection(nextSelection);

    try {
      const response = await persistPlan(nextSelection, nextPlan);

      if (!response.ok) {
        setMessage("Войдите, чтобы сохранить план в БД.");
        return;
      }

      setIsWizardOpen(false);
      setMessage("План обновлен и сохранен в профиле.");
      planRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } finally {
      setIsSaving(false);
    }
  }

  function goNext() {
    if (step < 3) {
      setStep((value) => value + 1);
      setMessage("");
      return;
    }

    void updateCurrentPlan();
  }

  async function saveCurrentPlan() {
    setIsSaving(true);

    try {
      const response = await persistPlan(planSelection, plan);
      setMessage(response.ok ? "План сохранен в профиле" : "Войдите, чтобы сохранить план");
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mb-8">
        <Badge>4 шага</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Выбор направления подготовки</h1>
        <p className="mt-3 text-muted-foreground">Мастер собирает роль, стек, уровень и дедлайн, затем строит персональный план.</p>
      </div>

      {isWizardOpen ? (
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
          <ProgressBar value={(step + 1) * 25} label={`Шаг ${step + 1} из 4`} />

          <div className="mt-8 min-h-[280px]">
            {step === 0 ? <OptionGrid title="Роль" items={roles} selected={[role]} onSelect={selectRole} /> : null}
            {step === 1 ? <OptionGrid title="Технологии" items={availableTech} selected={technologies} onSelect={toggleTech} multi /> : null}
            {step === 2 ? (
              <OptionGrid
                title="Уровень"
                items={levelOptions.map((item) => `${item}${item === "Junior" ? " (0-1 год)" : item === "Middle" ? " (1-3 года)" : " (3+ лет)"}`)}
                selected={[level]}
                onSelect={(item) => setLevel(item.split(" ")[0] as Level)}
              />
            ) : null}
            {step === 3 ? (
              <OptionGrid
                title="Когда собеседование?"
                items={urgencyOptions.map((item) => item.label)}
                selected={[urgencyLabels[urgency]]}
                onSelect={(label) => setUrgency(urgencyOptions.find((item) => item.label === label)?.value ?? "normal")}
              />
            ) : null}
          </div>

          <div className="flex justify-between gap-3 border-t border-border pt-5">
            <button disabled={step === 0 || isSaving} onClick={() => setStep((value) => Math.max(0, value - 1))} className="rounded-md border border-border px-4 py-2 text-sm font-semibold disabled:opacity-40">
              Назад
            </button>
            <button disabled={isSaving} onClick={goNext} className="rounded-md bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground disabled:opacity-60">
              {isSaving ? "Сохранение..." : step === 3 ? "Обновить план" : "Далее"}
            </button>
          </div>
        </div>
      ) : null}

      <section ref={planRef} className="mt-8 scroll-mt-24 rounded-lg border border-border bg-card p-5 shadow-sm sm:p-8">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-2xl font-bold">Персональный план</h2>
            <p className="text-sm text-muted-foreground">{planSelection.role}, {planSelection.level}, {urgencyLabels[planSelection.urgency].toLowerCase()}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {!isWizardOpen ? (
              <button onClick={() => setIsWizardOpen(true)} className="rounded-md border border-border px-4 py-2 text-sm font-semibold">
                Изменить выбор
              </button>
            ) : null}
            <button disabled={isSaving} onClick={saveCurrentPlan} className="rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary disabled:opacity-60">
              {isSaving ? "Сохранение..." : "Сохранить план"}
            </button>
          </div>
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
