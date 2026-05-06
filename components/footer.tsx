import Link from "next/link";

const groups = [
  { title: "Направления", links: ["JavaScript", "React", "TypeScript", "SQL"] },
  { title: "Ресурсы", links: ["Вопросы", "Квизы", "Гайды", "Roadmap"] },
  { title: "Компания", links: ["О проекте", "Контакты", "Блог", "Партнерство"] }
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto grid max-w-7xl gap-8 px-4 py-10 sm:px-6 md:grid-cols-4 lg:px-8">
        <div>
          <div className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
            <span className="grid h-9 w-9 place-items-center rounded-md bg-primary text-primary-foreground">IP</span>
            Interview Prep
          </div>
          <p className="text-sm leading-6 text-muted-foreground">Платформа для системной подготовки к техническим собеседованиям.</p>
        </div>
        {groups.map((group) => (
          <div key={group.title}>
            <h3 className="mb-3 text-sm font-bold">{group.title}</h3>
            <div className="grid gap-2 text-sm text-muted-foreground">
              {group.links.map((link) => (
                <Link key={link} href="#" className="hover:text-foreground">
                  {link}
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="border-t border-border px-4 py-5 text-center text-sm text-muted-foreground">© 2026 Interview Prep. Все права защищены.</div>
    </footer>
  );
}
