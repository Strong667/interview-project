import { Badge } from "@/components/ui";
import { ProfileForm } from "@/components/profile-form";
import { getCurrentUser } from "@/lib/auth";
import { getQuizResults, getUserPlans, getUserStats } from "@/lib/user-db";
import Link from "next/link";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <Badge>Профиль</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Нужно войти в аккаунт</h1>
        <p className="mt-4 text-muted-foreground">После входа здесь будут настройки уровня, стека и сохранённые данные подготовки.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Войти</Link>
      </main>
    );
  }

  const stats = getUserStats(user.id);
  const plans = getUserPlans(user.id);
  const quizResults = getQuizResults(user.id);

  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <Badge>Профиль</Badge>
      <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Профиль {user.name}</h1>
      <p className="mt-3 text-muted-foreground">{user.email} • {user.accountRole === "admin" ? "Администратор" : "Пользователь"}</p>
      {user.accountRole === "admin" ? (
        <Link href="/admin" className="mt-5 inline-flex rounded-md border border-primary px-4 py-2 text-sm font-semibold text-primary">
          Админ-панель
        </Link>
      ) : null}
      <section className="mt-8 grid gap-4 sm:grid-cols-4">
        {[
          [String(stats.plans), "планов"],
          [String(stats.quizzes), "квизов"],
          [String(stats.saved), "закладок"],
          [`${stats.accuracy}%`, "точность"]
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg border border-border bg-card p-4 shadow-sm">
            <div className="font-display text-2xl font-bold text-primary">{value}</div>
            <p className="text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>
      <ProfileForm user={user} />
      <section className="mt-8 grid gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold">Сохранённые планы</h2>
          <div className="mt-4 grid gap-3">
            {plans.length ? plans.map((plan) => (
              <article key={plan.id} className="rounded-md bg-muted p-3 text-sm">
                <strong>{plan.role}</strong>
                <p className="mt-1 text-muted-foreground">{plan.level} • {plan.urgency}</p>
              </article>
            )) : <p className="text-sm text-muted-foreground">Планов пока нет.</p>}
          </div>
        </div>
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="font-display text-xl font-bold">Результаты тестов</h2>
          <div className="mt-4 grid gap-3">
            {quizResults.length ? quizResults.map((result) => (
              <article key={result.id} className="rounded-md bg-muted p-3 text-sm">
                <strong>{result.topic}: {result.score}/{result.total}</strong>
                <p className="mt-1 text-muted-foreground">Слабые темы: {(JSON.parse(result.weak_topics) as string[]).join(", ") || "нет"}</p>
              </article>
            )) : <p className="text-sm text-muted-foreground">Результатов пока нет.</p>}
          </div>
        </div>
      </section>
    </main>
  );
}
