"use client";

import { useRouter } from "next/navigation";

export function LogoutButton() {
  const router = useRouter();

  async function logout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  return (
    <button onClick={logout} className="rounded-md border border-border px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:border-primary hover:text-primary">
      Выйти
    </button>
  );
}
