import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { LogoutButton } from "@/components/logout-button";
import { getCurrentUser } from "@/lib/auth";

const nav = [
  { href: "/directions", label: "Направления" },
  { href: "/questions/javascript", label: "Вопросы" },
  { href: "/blog", label: "Блог" },
  { href: "/about", label: "О нас" }
];

export async function Header() {
  const user = await getCurrentUser();

  return (
    <header className="fixed inset-x-0 top-0 z-50 border-b border-border bg-background/88 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 font-display text-lg font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">IP</span>
          Interview Prep
        </Link>
        <nav className="hidden items-center gap-6 text-sm font-medium text-muted-foreground md:flex">
          {nav.map((item) => (
            <Link key={item.href} href={item.href} className="transition hover:text-foreground">
              {item.label}
            </Link>
          ))}
          {user?.accountRole === "admin" ? (
            <Link href="/admin" className="transition hover:text-foreground">
              Админ
            </Link>
          ) : null}
        </nav>
        <div className="flex items-center gap-2">
          {user ? (
            <>
              <Link href="/profile" className="hidden rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90 sm:inline-flex">
                Профиль
              </Link>
              <LogoutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hidden rounded-md px-3 py-2 text-sm font-semibold text-muted-foreground transition hover:text-foreground sm:inline-flex">
                Войти
              </Link>
              <Link href="/register" className="rounded-md bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition hover:opacity-90">
                Регистрация
              </Link>
            </>
          )}
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
