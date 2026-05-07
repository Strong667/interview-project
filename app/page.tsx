import Link from "next/link";
import { DirectionCard, SectionTitle } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";
import { getDirections } from "@/lib/db";
import { getUserStats } from "@/lib/user-db";

const stats = [
  ["500+", "вопросов"],
  ["15", "направлений"],
  ["10 000+", "пользователей"]
];

const reviews = [
  ["Алина, Frontend", "Закрыла пробелы по Event Loop и hooks за неделю до интервью."],
  ["Дмитрий, Backend", "План подготовки помог не распыляться и повторять только важное."],
  ["Мария, Junior", "Формат карточек и быстрые квизы удобны перед созвонами."]
];

export default async function HomePage() {
  const directions = getDirections();
  const user = await getCurrentUser();
  const userStats = user ? getUserStats(user.id) : null;

  return (
    <main className="pt-16">
      <section className="relative overflow-hidden border-b border-border bg-gradient-to-br from-blue-50 via-background to-indigo-100 dark:from-slate-950 dark:via-background dark:to-blue-950">
        <div className="mx-auto grid min-h-[620px] max-w-7xl items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
          <div>
            <p className="mb-4 inline-flex rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">IT Interview Prep Platform</p>
            <h1 className="font-display text-4xl font-extrabold tracking-normal sm:text-6xl">Готовься к техническим собеседованиям системно</h1>
            <p className="mt-5 max-w-2xl text-lg leading-8 text-muted-foreground">Выбери роль, стек и уровень, получи план подготовки, изучай вопросы с ответами и закрепляй темы мини-тестами.</p>
            <div className="mt-8 flex max-w-2xl flex-col gap-3 sm:flex-row">
              <input className="focus-ring min-h-12 flex-1 rounded-md border border-border bg-card px-4 shadow-sm" placeholder="Быстрый поиск: React hooks, SQL JOIN, Docker..." />
              <Link href="/directions" className="inline-flex min-h-12 items-center justify-center rounded-md bg-primary px-6 font-bold text-primary-foreground transition hover:opacity-90">
                Выбрать направление
              </Link>
            </div>
          </div>
          <div className="relative rounded-lg border border-border bg-card p-5 shadow-soft">
            {user && userStats ? (
              <>
                <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
                  <span className="font-bold">Ваша аналитика</span>
                  <span className="rounded-md bg-emerald-500/10 px-2 py-1 text-xs font-bold text-emerald-600">{userStats.accuracy}%</span>
                </div>
                {[
                  ["Пройдено вопросов", userStats.progress, 80],
                  ["Правильных ответов", userStats.known, userStats.accuracy],
                  ["Сохранено вопросов", userStats.saved, 55],
                  ["Результатов тестов", userStats.quizzes, 40]
                ].map(([item, value, width]) => (
                  <div key={item} className="mb-3 rounded-md border border-border bg-background p-4">
                    <div className="mb-2 flex justify-between text-sm font-semibold"><span>{item}</span><span>{value}</span></div>
                    <div className="h-2 rounded-full bg-muted"><div className="h-2 rounded-full bg-primary" style={{ width: `${Number(value) > 0 ? width : 0}%` }} /></div>
                  </div>
                ))}
              </>
            ) : (
              <div className="flex min-h-[320px] flex-col justify-center">
                <span className="mb-4 inline-flex w-fit rounded-md border border-primary/20 bg-primary/10 px-3 py-1 text-sm font-bold text-primary">Аналитика профиля</span>
                <h2 className="font-display text-2xl font-bold">Войдите, чтобы посмотреть результаты</h2>
                <p className="mt-3 leading-7 text-muted-foreground">После входа здесь появятся ваш прогресс, сохранённые планы, результаты мини-тестов и рекомендации для повторения.</p>
                <Link href="/login" className="mt-6 inline-flex w-fit rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground transition hover:opacity-90">
                  Войти
                </Link>
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <SectionTitle eyebrow="Направления" title="Темы для подготовки" text="MVP покрывает ключевые frontend, backend, database, algorithms и DevOps-направления." />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {directions.map((direction) => (
            <DirectionCard key={direction.slug} {...direction} href={`/questions/${direction.slug}`} />
          ))}
        </div>
      </section>

      <section className="border-y border-border bg-card py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <SectionTitle title="Как это работает" />
          <div className="grid gap-4 md:grid-cols-3">
            {["Выбери стек и роль", "Изучи вопросы", "Пройди тест"].map((item, index) => (
              <div key={item} className="rounded-lg border border-border bg-background p-6">
                <span className="grid h-10 w-10 place-items-center rounded-md bg-primary text-primary-foreground">{index + 1}</span>
                <h3 className="mt-4 font-display text-xl font-bold">{item}</h3>
                <p className="mt-2 text-sm leading-6 text-muted-foreground">Платформа подбирает следующий шаг и показывает прогресс по темам.</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="grid gap-4 md:grid-cols-3">
          {stats.map(([value, label]) => (
            <div key={label} className="rounded-lg border border-border bg-card p-6 text-center shadow-sm">
              <div className="font-display text-4xl font-extrabold text-primary">{value}</div>
              <div className="mt-2 text-muted-foreground">{label}</div>
            </div>
          ))}
        </div>
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {reviews.map(([name, text]) => (
            <article key={name} className="rounded-lg border border-border bg-card p-6 shadow-sm">
              <p className="leading-7 text-muted-foreground">&ldquo;{text}&rdquo;</p>
              <h3 className="mt-4 font-bold">{name}</h3>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
