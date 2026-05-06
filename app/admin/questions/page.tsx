import Link from "next/link";
import { AdminQuestionForm } from "@/components/admin-question-form";
import { Badge } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getDirections } from "@/lib/db";

export default async function AdminQuestionsPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <Badge>Вопросы</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Нужно войти</h1>
        <Link href="/login" className="mt-6 inline-flex rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Войти</Link>
      </main>
    );
  }

  if (user.accountRole !== "admin") {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <Badge>Вопросы</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Недостаточно прав</h1>
        <Link href="/profile" className="mt-6 inline-flex rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Профиль</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-5xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>Администратор</Badge>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Добавить вопрос</h1>
          <p className="mt-4 text-muted-foreground">Новый вопрос сохраняется в SQLite и сразу появляется на странице выбранного направления.</p>
        </div>
        <Link href="/admin" className="rounded-md border border-border px-4 py-2 text-sm font-semibold hover:border-primary hover:text-primary">Назад</Link>
      </div>
      <AdminQuestionForm directions={getDirections()} />
    </main>
  );
}
