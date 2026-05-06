"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import type { User } from "@/lib/user-db";

export function ProfileForm({ user }: { user: User }) {
  const router = useRouter();
  const hasProfileDetails = Boolean(user.role || user.stack || user.level);
  const [profile, setProfile] = useState(user);
  const [isEditing, setIsEditing] = useState(!hasProfileDetails);
  const [message, setMessage] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const response = await fetch("/api/profile", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: form.get("name"),
        role: form.get("role"),
        stack: form.get("stack"),
        level: form.get("level")
      })
    });

    if (!response.ok) {
      setMessage("Не удалось сохранить профиль");
      return;
    }

    const data = (await response.json()) as { user: User | null };
    if (data.user) {
      setProfile(data.user);
    }

    setIsEditing(false);
    setMessage("Профиль сохранён");
    router.refresh();
  }

  if (!isEditing) {
    const rows = [
      ["Имя", profile.name],
      ["Роль", profile.role || "Не указана"],
      ["Основной стек", profile.stack || "Не указан"],
      ["Уровень", profile.level || "Не указан"]
    ];

    return (
      <section className="mt-8 rounded-lg border border-border bg-card p-6 shadow-sm">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-display text-xl font-bold">Данные профиля</h2>
            {message ? <p className="mt-1 text-sm text-muted-foreground">{message}</p> : null}
          </div>
          <button
            type="button"
            onClick={() => {
              setIsEditing(true);
              setMessage("");
            }}
            className="rounded-md border border-border px-4 py-2 text-sm font-semibold transition hover:border-primary hover:text-primary"
          >
            Редактировать
          </button>
        </div>
        <dl className="mt-5 grid gap-4 sm:grid-cols-2">
          {rows.map(([label, value]) => (
            <div key={label} className="rounded-md bg-muted p-4">
              <dt className="text-xs font-semibold uppercase text-muted-foreground">{label}</dt>
              <dd className="mt-1 font-medium">{value}</dd>
            </div>
          ))}
        </dl>
      </section>
    );
  }

  return (
    <form onSubmit={submit} className="mt-8 grid gap-4 rounded-lg border border-border bg-card p-6 shadow-sm">
      <label className="grid gap-2 text-sm font-semibold">
        Имя
        <input name="name" defaultValue={profile.name} className="focus-ring rounded-md border border-border bg-background px-3 py-2" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Роль
        <input name="role" defaultValue={profile.role ?? ""} className="focus-ring rounded-md border border-border bg-background px-3 py-2" placeholder="Frontend Developer" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Основной стек
        <input name="stack" defaultValue={profile.stack ?? ""} className="focus-ring rounded-md border border-border bg-background px-3 py-2" placeholder="React, TypeScript, SQL" />
      </label>
      <label className="grid gap-2 text-sm font-semibold">
        Уровень
        <input name="level" defaultValue={profile.level ?? ""} className="focus-ring rounded-md border border-border bg-background px-3 py-2" placeholder="Junior / Middle / Senior" />
      </label>
      {message ? <p className="text-sm text-muted-foreground">{message}</p> : null}
      <button className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Сохранить</button>
    </form>
  );
}
