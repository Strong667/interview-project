import { Badge } from "@/components/ui";

export default function AboutPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 pb-16 pt-24 sm:px-6 lg:px-8">
      <Badge>О проекте</Badge>
      <h1 className="mt-3 font-display text-3xl font-bold sm:text-5xl">Платформа для сфокусированной подготовки</h1>
      <p className="mt-5 text-lg leading-8 text-muted-foreground">Interview Prep помогает junior и middle-разработчикам быстро понять, какие темы повторять перед техническим интервью, и закрепить знания через вопросы, карточки и тесты.</p>
    </main>
  );
}
