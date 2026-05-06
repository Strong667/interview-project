import Link from "next/link";
import { AuthForm } from "@/components/auth-form";
import { Badge } from "@/components/ui";

export default function RegisterPage() {
  return (
    <main className="mx-auto max-w-md px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <Badge>Регистрация</Badge>
      <h1 className="mt-3 font-display text-3xl font-bold">Создать аккаунт</h1>
      <p className="mt-3 text-sm text-muted-foreground">JWT-токен сохраняется в httpOnly cookie, пользовательские данные пишутся в SQLite.</p>
      <AuthForm mode="register" />
      <p className="mt-5 text-sm text-muted-foreground">
        Уже есть аккаунт? <Link href="/login" className="font-semibold text-primary">Войти</Link>
      </p>
    </main>
  );
}
