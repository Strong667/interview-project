import { Badge } from "@/components/ui";

export default function ContactPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <Badge>Контакты</Badge>
      <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Обратная связь</h1>
      <form className="mt-8 grid gap-4 rounded-lg border border-border bg-card p-6 shadow-sm">
        <input className="focus-ring rounded-md border border-border bg-background px-3 py-2" placeholder="Ваш email" />
        <textarea className="focus-ring min-h-36 rounded-md border border-border bg-background px-3 py-2" placeholder="Сообщение" />
        <button className="rounded-md bg-primary px-5 py-2 font-semibold text-primary-foreground">Отправить</button>
      </form>
    </main>
  );
}
