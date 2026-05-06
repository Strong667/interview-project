import Link from "next/link";
import { Badge, ProgressBar } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getDirections } from "@/lib/db";
import { getRecentActivity, getUserStats } from "@/lib/user-db";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  const directions = getDirections();
  const stats = user ? getUserStats(user.id) : null;
  const activity = user ? getRecentActivity(user.id).map((item) => item.title) : [];

  if (!user || !stats) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <Badge>Личный кабинет</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Войдите, чтобы видеть прогресс</h1>
        <p className="mt-4 text-muted-foreground">Планы, результаты квизов, закладки и статистика сохраняются только для авторизованных пользователей.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Войти</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <Badge>Личный кабинет</Badge>
          <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Прогресс и рекомендации</h1>
        </div>
        <Link href="/directions" className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Обновить план</Link>
      </div>
      <section className="grid gap-4 md:grid-cols-4">
        {[
          [String(stats.progress), "пройдено вопросов"],
          [`${stats.accuracy}%`, "правильных ответов"],
          [String(stats.quizzes), "результатов тестов"],
          [String(stats.saved), "закладок"]
        ].map(([value, label]) => (
          <div key={label} className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <div className="font-display text-3xl font-extrabold text-primary">{value}</div>
            <p className="mt-1 text-sm text-muted-foreground">{label}</p>
          </div>
        ))}
      </section>
      <section className="mt-8 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
          <h2 className="mb-5 font-display text-2xl font-bold">Прогресс по темам</h2>
          <div className="grid gap-5">
            {directions.slice(0, 7).map((direction, index) => (
              <ProgressBar key={direction.slug} value={86 - index * 9} label={direction.title} />
            ))}
          </div>
        </div>
        <aside className="space-y-6">
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-display text-xl font-bold">Последняя активность</h2>
            <div className="grid gap-3">
              {(activity.length ? activity : ["Пока нет активности"]).map((item) => (
                <div key={item} className="rounded-md bg-muted p-3 text-sm">{item}</div>
              ))}
            </div>
          </div>
          <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
            <h2 className="mb-4 font-display text-xl font-bold">Повторить</h2>
            <div className="grid gap-3">
              {["Event Loop", "Indexes", "Cache invalidation"].map((item) => (
                <Link key={item} href="/questions/javascript" className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-primary">{item}</Link>
              ))}
            </div>
          </div>
        </aside>
      </section>
    </main>
  );
}
