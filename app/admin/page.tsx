import Link from "next/link";
import { Badge } from "@/components/ui";
import { getCurrentUser } from "@/lib/auth";

export default async function AdminPage() {
  const user = await getCurrentUser();

  if (!user) {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <Badge>Администратор</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Нужно войти</h1>
        <p className="mt-4 text-muted-foreground">Админ-раздел доступен только администратору.</p>
        <Link href="/login" className="mt-6 inline-flex rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Войти</Link>
      </main>
    );
  }

  if (user.accountRole !== "admin") {
    return (
      <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
        <Badge>Администратор</Badge>
        <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Недостаточно прав</h1>
        <p className="mt-4 text-muted-foreground">Ваш аккаунт имеет роль обычного пользователя.</p>
        <Link href="/profile" className="mt-6 inline-flex rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Профиль</Link>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-7xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <Badge>Администратор</Badge>
      <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Админ-панель</h1>
      <p className="mt-4 text-muted-foreground">Управление пользователями и базой вопросов разделено по страницам.</p>
      <div className="mt-8 grid gap-4 md:grid-cols-2">
        <Link href="/admin/users" className="rounded-lg border border-border bg-card p-6 shadow-sm transition hover:border-primary">
          <h2 className="font-display text-2xl font-bold">Пользователи</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Таблица аккаунтов, роли, удаление и смена пароля.</p>
        </Link>
        <Link href="/admin/questions" className="rounded-lg border border-border bg-card p-6 shadow-sm transition hover:border-primary">
          <h2 className="font-display text-2xl font-bold">Вопросы</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">Добавление новых вопросов в SQLite базу.</p>
        </Link>
      </div>
    </main>
  );
}
