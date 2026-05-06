import Link from "next/link";
import { Badge } from "@/components/ui";

const posts = [
  ["Как отвечать на вопросы про Event Loop", "Порядок выполнения, microtasks и типовые ловушки."],
  ["React interview checklist", "Hooks, state, performance и архитектурные вопросы."],
  ["SQL для backend-собеседования", "JOIN, индексы, транзакции и explain plan."]
];

export default function BlogPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <Badge>Гайды</Badge>
      <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Статьи и материалы</h1>
      <div className="mt-8 grid gap-4 md:grid-cols-3">
        {posts.map(([title, text]) => (
          <article key={title} className="rounded-lg border border-border bg-card p-6 shadow-sm">
            <h2 className="font-display text-xl font-bold">{title}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">{text}</p>
            <Link href="#" className="mt-5 inline-flex text-sm font-bold text-primary">Читать</Link>
          </article>
        ))}
      </div>
    </main>
  );
}
