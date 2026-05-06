import Link from "next/link";
import type { ReactNode } from "react";

export function Badge({ children, tone = "default" }: { children: ReactNode; tone?: "default" | "success" | "warning" }) {
  const tones = {
    default: "border-primary/25 bg-primary/10 text-primary",
    success: "border-emerald-500/25 bg-emerald-500/10 text-emerald-600 dark:text-emerald-300",
    warning: "border-amber-500/25 bg-amber-500/10 text-amber-700 dark:text-amber-300"
  };
  return <span className={`inline-flex rounded-md border px-2 py-1 text-xs font-semibold ${tones[tone]}`}>{children}</span>;
}

export function ProgressBar({ value, label }: { value: number; label?: string }) {
  return (
    <div className="space-y-2">
      {label ? <div className="flex justify-between text-sm text-muted-foreground"><span>{label}</span><span>{value}%</span></div> : null}
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${Math.max(0, Math.min(100, value))}%` }} />
      </div>
    </div>
  );
}

export function SectionTitle({ eyebrow, title, text }: { eyebrow?: string; title: string; text?: string }) {
  return (
    <div className="mx-auto mb-8 max-w-2xl text-center">
      {eyebrow ? <p className="mb-2 text-sm font-bold uppercase text-primary">{eyebrow}</p> : null}
      <h2 className="font-display text-3xl font-bold tracking-normal sm:text-4xl">{title}</h2>
      {text ? <p className="mt-3 text-muted-foreground">{text}</p> : null}
    </div>
  );
}

export function DirectionCard({ title, icon, questions, description, href }: { title: string; icon: string; questions: number; description: string; href: string }) {
  return (
    <article className="group rounded-lg border border-border bg-card p-5 shadow-sm transition hover:-translate-y-1 hover:border-primary hover:shadow-soft">
      <div className="mb-4 flex items-center justify-between">
        <span className="grid h-11 w-11 place-items-center rounded-md bg-primary/10 font-bold text-primary">{icon}</span>
        <Badge>{questions}+ вопросов</Badge>
      </div>
      <h3 className="font-display text-xl font-bold">{title}</h3>
      <p className="mt-2 min-h-12 text-sm leading-6 text-muted-foreground">{description}</p>
      <Link href={href} className="mt-5 inline-flex rounded-md border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary">
        Перейти
      </Link>
    </article>
  );
}
