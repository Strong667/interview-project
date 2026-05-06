"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function AuthForm({ mode }: { mode: "login" | "register" }) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError("");

    const form = new FormData(event.currentTarget);
    const response = await fetch(`/api/auth/${mode}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        email: form.get("email"),
        password: form.get("password")
      })
    });

    const data = (await response.json()) as { error?: string };
    setLoading(false);

    if (!response.ok) {
      setError(data.error ?? "Не удалось выполнить запрос.");
      return;
    }

    router.push("/profile");
    router.refresh();
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      {mode === "register" ? (
        <label className="grid gap-2 text-sm font-semibold">
          Имя
          <input name="name" required className="focus-ring rounded-md border border-border bg-background px-3 py-2" placeholder="Ваше имя" />
        </label>
      ) : null}
      <label className="grid gap-2 text-sm font-semibold">
        Email
        <input name="email" type="email" required className="focus-ring rounded-md border border-border bg-background px-3 py-2" placeholder="you@example.com" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Пароль
        <input name="password" type="password" required minLength={6} className="focus-ring rounded-md border border-border bg-background px-3 py-2" placeholder="Минимум 6 символов" />
      </label>
      {error ? <p className="rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p> : null}
      <button disabled={loading} className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground disabled:opacity-60">
        {loading ? "Подождите..." : mode === "login" ? "Войти" : "Зарегистрироваться"}
      </button>
    </form>
  );
}
