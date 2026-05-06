import Link from "next/link";
import { Badge } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getSavedQuestions } from "@/lib/user-db";

export default async function SavedPage() {
  const user = await getCurrentUser();
  const questions = user ? getSavedQuestions(user.id) : [];

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <Badge>Закладки</Badge>
      <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Сохранённые вопросы</h1>
      {!user ? (
        <div className="mt-8 rounded-lg border border-border bg-card p-8 text-center shadow-sm">
          <p className="text-muted-foreground">Войдите, чтобы видеть сохранённые вопросы.</p>
          <Link href="/login" className="mt-5 inline-flex rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Войти</Link>
        </div>
      ) : (
        <div className="mt-8 grid gap-4">
          {questions.length ? questions.map((item) => (
            <article key={item.id} className="rounded-lg border border-border bg-card p-5 shadow-sm">
              <Badge>{item.subtopic}</Badge>
              <h2 className="mt-3 font-display text-xl font-bold">{item.question}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{item.answer}</p>
            </article>
          )) : (
            <div className="rounded-lg border border-border bg-card p-8 text-center shadow-sm">
              <p className="text-muted-foreground">Сохранённых вопросов пока нет.</p>
              <Link href="/questions/javascript" className="mt-5 inline-flex rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Перейти к вопросам</Link>
            </div>
          )}
        </div>
      )}
    </main>
  );
}
