"use client";

import { useState } from "react";
import type { AdminUserRow } from "@/lib/user-db";

export function AdminUsersTable({ users, currentUserId }: { users: AdminUserRow[]; currentUserId: number }) {
  const [items, setItems] = useState(users);
  const [activeId, setActiveId] = useState<number | null>(null);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function changeRole(user: AdminUserRow) {
    setMessage("");
    setError("");
    const nextRole = user.accountRole === "admin" ? "user" : "admin";
    const response = await fetch(`/api/admin/users/${user.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: user.name,
        email: user.email,
        accountRole: nextRole,
        role: user.role ?? "",
        stack: user.stack ?? "",
        level: user.level ?? ""
      })
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Не удалось сменить роль.");
      return;
    }

    setItems((current) => current.map((item) => (item.id === user.id ? { ...item, accountRole: nextRole } : item)));
    setMessage("Роль пользователя обновлена");
    setActiveId(null);
  }

  async function changePassword(userId: number) {
    const password = window.prompt("Введите новый пароль. Минимум 6 символов.");
    if (!password) return;

    setMessage("");
    setError("");
    const response = await fetch(`/api/admin/users/${userId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password })
    });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Не удалось сменить пароль.");
      return;
    }

    setMessage("Пароль обновлён");
    setActiveId(null);
  }

  async function deleteUser(userId: number) {
    if (!window.confirm("Удалить пользователя и все его данные?")) return;

    setMessage("");
    setError("");
    const response = await fetch(`/api/admin/users/${userId}`, { method: "DELETE" });
    const data = (await response.json()) as { error?: string };

    if (!response.ok) {
      setError(data.error ?? "Не удалось удалить пользователя.");
      return;
    }

    setItems((current) => current.filter((item) => item.id !== userId));
    setMessage("Пользователь удалён");
    setActiveId(null);
  }

  return (
    <section className="mt-8 rounded-lg border border-border bg-card shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border p-5">
        <div>
          <h2 className="font-display text-2xl font-bold">Пользователи</h2>
          <p className="mt-1 text-sm text-muted-foreground">Таблица аккаунтов, ролей и действий.</p>
        </div>
        <span className="rounded-md bg-muted px-3 py-2 text-sm font-semibold">{items.length} аккаунтов</span>
      </div>

      {message ? <p className="mx-5 mt-4 rounded-md border border-emerald-500/25 bg-emerald-500/10 px-3 py-2 text-sm text-emerald-600 dark:text-emerald-300">{message}</p> : null}
      {error ? <p className="mx-5 mt-4 rounded-md border border-red-500/25 bg-red-500/10 px-3 py-2 text-sm text-red-600 dark:text-red-300">{error}</p> : null}

      <div className="overflow-x-auto">
        <table className="w-full min-w-[760px] border-collapse text-left text-sm">
          <thead className="bg-muted text-xs uppercase text-muted-foreground">
            <tr>
              <th className="px-5 py-3 font-bold">Имя</th>
              <th className="px-5 py-3 font-bold">Логин</th>
              <th className="px-5 py-3 font-bold">Роль</th>
              <th className="px-5 py-3 font-bold">Дата добавления</th>
              <th className="px-5 py-3 text-right font-bold">Действия</th>
            </tr>
          </thead>
          <tbody>
            {items.map((user) => (
              <tr key={user.id} className="border-t border-border">
                <td className="px-5 py-4 font-semibold">{user.name}</td>
                <td className="px-5 py-4 text-muted-foreground">{user.email}</td>
                <td className="px-5 py-4">
                  <span className={`rounded-md px-2 py-1 text-xs font-bold ${user.accountRole === "admin" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                    {user.accountRole === "admin" ? "Администратор" : "Пользователь"}
                  </span>
                </td>
                <td className="px-5 py-4 text-muted-foreground">{user.createdAt}</td>
                <td className="relative px-5 py-4 text-right">
                  <button onClick={() => setActiveId(activeId === user.id ? null : user.id)} className="rounded-md border border-border px-3 py-2 text-sm font-semibold hover:border-primary hover:text-primary">
                    Действия
                  </button>
                  {activeId === user.id ? (
                    <div className="absolute right-5 top-14 z-20 grid w-56 gap-1 rounded-lg border border-border bg-card p-2 text-left shadow-soft">
                      <button onClick={() => changeRole(user)} disabled={user.id === currentUserId} className="rounded-md px-3 py-2 text-left text-sm hover:bg-muted disabled:cursor-not-allowed disabled:opacity-50">
                        Сменить роль
                      </button>
                      <button onClick={() => changePassword(user.id)} className="rounded-md px-3 py-2 text-left text-sm hover:bg-muted">
                        Поменять пароль
                      </button>
                      <button onClick={() => deleteUser(user.id)} disabled={user.id === currentUserId} className="rounded-md px-3 py-2 text-left text-sm text-red-600 hover:bg-red-500/10 disabled:cursor-not-allowed disabled:opacity-50">
                        Удалить пользователя
                      </button>
                    </div>
                  ) : null}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
