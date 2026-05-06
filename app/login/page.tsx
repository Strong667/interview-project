import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Badge } from "@/components/ui";

export default function LoginPage() {
  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <Badge>Вход</Badge>
      <h1 className="mt-3 font-display text-3xl font-bold">Войти в профиль</h1>
      <p className="mt-3 text-sm text-muted-foreground">После входа сохраняются планы, результаты тестов, закладки и прогресс по вопросам.</p>
      <AuthForm mode="login" />
      <p className="mt-5 text-sm text-muted-foreground">
        Нет аккаунта? <Link href="/register" className="font-semibold text-primary">Регистрация</Link>
      </p>
    </main>
  );
}
