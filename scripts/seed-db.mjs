import fs from "fs";
import path from "path";
import crypto from "crypto";
import { DatabaseSync } from "node:sqlite";

const dataDir = path.join(process.cwd(), "data");
const dbPath = path.join(dataDir, "interview.db");

fs.mkdirSync(dataDir, { recursive: true });
if (fs.existsSync(dbPath)) fs.unlinkSync(dbPath);

const db = new DatabaseSync(dbPath);

db.exec(`
  pragma foreign_keys = on;

  create table directions (
    slug text primary key,
    title text not null,
    icon text not null,
    question_target integer not null,
    description text not null,
    sort_order integer not null
  );

  create table direction_topics (
    id integer primary key autoincrement,
    direction_slug text not null references directions(slug) on delete cascade,
    title text not null,
    sort_order integer not null
  );

  create table questions (
    id text primary key,
    topic text not null references directions(slug) on delete cascade,
    subtopic text not null,
    level text not null check(level in ('Junior', 'Middle', 'Senior')),
    type text not null check(type in ('theory', 'practice', 'code')),
    tags text not null,
    question text not null,
    answer text not null,
    code text,
    sort_order integer not null
  );

  create table roles (
    id integer primary key autoincrement,
    title text not null unique,
    sort_order integer not null
  );

  create table technologies (
    id integer primary key autoincrement,
    title text not null unique
  );

  create table role_technologies (
    role_id integer not null references roles(id) on delete cascade,
    technology_id integer not null references technologies(id) on delete cascade,
    sort_order integer not null,
    primary key (role_id, technology_id)
  );

  create table users (
    id integer primary key autoincrement,
    email text not null unique,
    name text not null,
    password_hash text not null,
    password_salt text not null,
    account_role text not null default 'user' check(account_role in ('user', 'admin')),
    role text,
    stack text,
    level text,
    created_at text not null default current_timestamp
  );

  create table saved_questions (
    user_id integer not null references users(id) on delete cascade,
    question_id text not null references questions(id) on delete cascade,
    created_at text not null default current_timestamp,
    primary key (user_id, question_id)
  );

  create table question_progress (
    user_id integer not null references users(id) on delete cascade,
    question_id text not null references questions(id) on delete cascade,
    status text not null check(status in ('known', 'unknown')),
    updated_at text not null default current_timestamp,
    primary key (user_id, question_id)
  );

  create table prep_plans (
    id integer primary key autoincrement,
    user_id integer not null references users(id) on delete cascade,
    role text not null,
    level text not null,
    urgency text not null,
    technologies text not null,
    plan text not null,
    created_at text not null default current_timestamp
  );

  create table quiz_results (
    id integer primary key autoincrement,
    user_id integer not null references users(id) on delete cascade,
    topic text not null references directions(slug) on delete cascade,
    score integer not null,
    total integer not null,
    weak_topics text not null,
    created_at text not null default current_timestamp
  );
`);

const directions = [
  ["javascript", "JavaScript", "JS", 86, "Язык, runtime-модель и типовые задачи frontend-интервью.", ["Closures", "Hoisting", "Event Loop", "Promise", "Prototype"]],
  ["html-css", "HTML/CSS", "HC", 54, "Верстка, адаптивность, доступность и архитектура CSS.", ["Семантика", "Flexbox", "Grid", "BEM", "A11y"]],
  ["react", "React", "RX", 64, "Компонентная модель, состояние и оптимизация интерфейсов.", ["Hooks", "State", "Virtual DOM", "Redux", "Optimization"]],
  ["vue", "Vue", "VU", 35, "Реактивность, компоненты и SPA-паттерны.", ["Reactivity", "Composition API", "Pinia"]],
  ["angular", "Angular", "NG", 38, "Enterprise-фреймворк, RxJS и архитектура модулей.", ["DI", "RxJS", "Forms"]],
  ["typescript", "TypeScript", "TS", 42, "Типизация, generic-паттерны и безопасные API.", ["Types", "Interfaces", "Generics", "Utility Types"]],
  ["node", "Node.js", "ND", 44, "Серверный JavaScript, REST и асинхронная I/O-модель.", ["Event Loop", "Streams", "Express", "Auth"]],
  ["python", "Python", "PY", 40, "Базовый язык, backend-паттерны и практические задачи.", ["Core", "Async", "OOP", "Testing"]],
  ["sql", "SQL", "DB", 43, "Запросы, индексы, транзакции и моделирование данных.", ["JOIN", "Indexes", "Transactions", "NoSQL"]],
  ["git", "Git", "GT", 32, "Рабочие процессы, история изменений и доставка.", ["Workflow", "Rebase", "CI/CD"]],
  ["algorithms", "Алгоритмы", "AL", 52, "Сложность, структуры данных и классические задачи.", ["Big O", "Sorting", "Trees", "Graphs", "DP"]],
  ["system-design", "System Design", "SD", 31, "Масштабирование, отказоустойчивость и архитектура сервисов.", ["Scaling", "Cache", "Queues", "CAP"]],
  ["devops", "DevOps", "DO", 34, "Инфраструктура, пайплайны, контейнеры и эксплуатация.", ["Docker", "Linux", "CI/CD", "SRE"]]
];

const questions = [
  ["js-closure", "javascript", "Closures", "Junior", "theory", ["scope", "function"], "Что такое замыкание в JavaScript и зачем оно нужно?", "Замыкание возникает, когда функция сохраняет доступ к переменным внешней области видимости после завершения этой внешней функции. Его используют для инкапсуляции состояния, фабрик функций и callback-логики.", "function makeCounter() {\n  let count = 0;\n  return () => ++count;\n}\n\nconst next = makeCounter();\nnext(); // 1\nnext(); // 2"],
  ["js-event-loop", "javascript", "Event Loop", "Middle", "practice", ["async", "runtime"], "В каком порядке выполнятся Promise, setTimeout и синхронный код?", "Сначала выполняется синхронный стек, затем microtask queue с Promise callbacks, затем macrotask queue, куда попадает setTimeout. Поэтому Promise обычно отработает раньше таймера с задержкой 0.", "console.log('A');\nsetTimeout(() => console.log('B'), 0);\nPromise.resolve().then(() => console.log('C'));\nconsole.log('D');\n// A, D, C, B"],
  ["js-prototype", "javascript", "Prototype", "Middle", "theory", ["oop", "prototype"], "Чем prototype отличается от __proto__?", "prototype есть у функций-конструкторов и используется как объект-прототип для создаваемых экземпляров. __proto__ указывает на фактический прототип конкретного объекта; в современном коде предпочтительнее Object.getPrototypeOf.", null],
  ["html-semantic", "html-css", "Семантика", "Junior", "theory", ["html", "seo", "a11y"], "Зачем использовать семантические HTML-теги?", "Семантические теги описывают смысл блока для браузера, поисковых систем и assistive technologies. Это улучшает доступность, SEO и поддержку разметки.", null],
  ["css-flex-grid", "html-css", "Flexbox", "Junior", "practice", ["layout", "css"], "Когда выбрать Flexbox, а когда Grid?", "Flexbox удобен для одномерного расположения по строке или колонке. Grid лучше подходит для двумерных сеток, где важны и строки, и колонки.", null],
  ["css-bem", "html-css", "BEM", "Middle", "theory", ["architecture", "css"], "Как BEM снижает конфликты CSS?", "BEM задаёт явную структуру block__element--modifier и делает селекторы предсказуемыми. Это уменьшает каскадные конфликты и облегчает переиспользование компонентов.", null],
  ["react-hooks", "react", "Hooks", "Junior", "theory", ["state", "effects"], "Какие правила hooks в React нельзя нарушать?", "Hooks вызываются только на верхнем уровне React-компонента или кастомного hook и не вызываются внутри условий, циклов или вложенных функций. Так React сохраняет стабильный порядок hook-вызовов между рендерами.", null],
  ["react-memo", "react", "Optimization", "Middle", "practice", ["memo", "render"], "Когда useMemo и React.memo действительно полезны?", "Они полезны, когда вычисление дорогое или стабильная ссылка предотвращает дорогие дочерние рендеры. Не стоит применять их автоматически: memoization добавляет сложность и тоже имеет стоимость.", null],
  ["react-state", "react", "State", "Junior", "theory", ["state", "props"], "Чем state отличается от props?", "Props приходят от родителя и считаются входными данными компонента. State принадлежит самому компоненту и меняется через setState/useState, вызывая повторный рендер.", null],
  ["vue-reactivity", "vue", "Reactivity", "Junior", "theory", ["vue", "proxy"], "Как работает реактивность во Vue 3?", "Vue 3 использует Proxy для отслеживания чтения и записи свойств. При изменении зависимостей framework планирует обновление связанных эффектов и компонентов.", null],
  ["angular-di", "angular", "DI", "Middle", "theory", ["services", "architecture"], "Зачем Angular dependency injection?", "DI отделяет создание зависимостей от их использования. Компоненты получают сервисы через injector, что упрощает тестирование и замену реализаций.", null],
  ["ts-generics", "typescript", "Generics", "Middle", "code", ["types", "api"], "Как generic помогает сохранить тип результата функции?", "Generic-параметр связывает тип входа и выхода. TypeScript выводит конкретный тип при вызове и не теряет информацию до any или слишком широкого union.", "function first<T>(items: T[]): T | undefined {\n  return items[0];\n}\n\nconst user = first([{ id: 1, name: 'Ada' }]);"],
  ["ts-interface-type", "typescript", "Interfaces", "Junior", "theory", ["types"], "Когда использовать interface, а когда type?", "Оба описывают форму данных. Interface удобен для объектных контрактов и расширения через declaration merging, type универсальнее для union, tuple и mapped types.", null],
  ["node-streams", "node", "Streams", "Middle", "practice", ["io", "performance"], "Зачем нужны streams в Node.js?", "Streams позволяют обрабатывать данные частями, не загружая весь файл или ответ в память. Это важно для больших файлов, проксирования и сетевого I/O.", null],
  ["node-auth", "node", "Auth", "Middle", "theory", ["jwt", "security"], "Что важно проверить при JWT-аутентификации?", "Нужно проверять подпись, срок действия, issuer/audience при необходимости, хранить секрет безопасно и учитывать стратегию отзыва токенов.", null],
  ["python-gil", "python", "Core", "Middle", "theory", ["runtime", "threads"], "Что такое GIL в Python?", "GIL ограничивает одновременное выполнение Python bytecode несколькими потоками в одном процессе. Для CPU-bound задач часто используют multiprocessing, для I/O-bound подходят async или threads.", null],
  ["sql-index", "sql", "Indexes", "Middle", "theory", ["database", "performance"], "Почему индекс ускоряет SELECT, но может замедлить INSERT?", "Индекс хранит дополнительную структуру поиска. SELECT быстрее находит строки, но при INSERT, UPDATE и DELETE базе нужно обновлять и таблицу, и все затронутые индексы.", null],
  ["sql-join", "sql", "JOIN", "Junior", "practice", ["database", "query"], "Чем INNER JOIN отличается от LEFT JOIN?", "INNER JOIN возвращает только совпавшие строки из обеих таблиц. LEFT JOIN сохраняет все строки левой таблицы и подставляет NULL, если справа совпадения нет.", null],
  ["git-rebase", "git", "Rebase", "Middle", "practice", ["workflow"], "Чем rebase отличается от merge?", "Merge создаёт коммит слияния и сохраняет ветвление истории. Rebase переносит коммиты поверх новой базы, делая историю линейной, но меняет hash коммитов.", null],
  ["algo-big-o", "algorithms", "Big O", "Junior", "practice", ["complexity", "arrays"], "Как оценить сложность поиска дубликатов через Set?", "Один проход по массиву даёт O(n) по времени. Set хранит уже встреченные элементы, поэтому память тоже O(n) в худшем случае.", null],
  ["algo-tree", "algorithms", "Trees", "Middle", "theory", ["data-structures"], "Что такое бинарное дерево поиска?", "Это дерево, где для каждого узла значения слева меньше, а справа больше. При сбалансированности поиск, вставка и удаление работают за O(log n).", null],
  ["system-cache", "system-design", "Cache", "Senior", "theory", ["scaling", "redis"], "Какие риски есть у cache-aside подхода?", "Основные риски: устаревшие данные, cache stampede, сложность инвалидации и разные источники истины. Их снижают TTL, single-flight, фоновые обновления и явная стратегия инвалидации.", null],
  ["system-queue", "system-design", "Queues", "Middle", "theory", ["async", "architecture"], "Зачем в архитектуре нужны очереди сообщений?", "Очереди развязывают сервисы по времени, сглаживают пики нагрузки и позволяют повторять обработку задач. Цена подхода: eventual consistency и более сложная observability.", null],
  ["devops-docker", "devops", "Docker", "Junior", "practice", ["container", "ci"], "Зачем в Dockerfile использовать многостадийную сборку?", "Многостадийная сборка отделяет build-зависимости от runtime-образа. Итоговый образ меньше, быстрее скачивается и содержит меньше лишних инструментов.", null],
  ["devops-ci", "devops", "CI/CD", "Middle", "theory", ["pipeline"], "Что должен делать базовый CI pipeline?", "Минимальный pipeline устанавливает зависимости, запускает lint, тесты, сборку и публикует артефакт или deploy только после успешных проверок.", null]
];

const roleTechnologies = {
  "Frontend Developer": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Vue", "Angular", "Next.js", "Git", "Алгоритмы"],
  "Backend Developer": ["Node.js", "Python", "Java", "Go", "SQL", "REST API", "GraphQL", "Git", "System Design"],
  "Fullstack Developer": ["HTML", "CSS", "JavaScript", "TypeScript", "React", "Node.js", "SQL", "REST API", "Git", "System Design"],
  "Mobile Developer": ["JavaScript", "TypeScript", "React", "Алгоритмы", "Git", "System Design"],
  "DevOps / SRE": ["Git", "Docker", "Linux", "CI/CD", "System Design", "SQL"],
  "Data / ML Engineer": ["Python", "SQL", "Алгоритмы", "System Design", "Git"]
};

const insertDirection = db.prepare("insert into directions values (?, ?, ?, ?, ?, ?)");
const insertTopic = db.prepare("insert into direction_topics(direction_slug, title, sort_order) values (?, ?, ?)");
directions.forEach(([slug, title, icon, target, description, topics], index) => {
  insertDirection.run(slug, title, icon, target, description, index + 1);
  topics.forEach((topic, topicIndex) => insertTopic.run(slug, topic, topicIndex + 1));
});

const insertQuestion = db.prepare("insert into questions values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
questions.forEach((question, index) => {
  const [id, topic, subtopic, level, type, tags, title, answer, code] = question;
  insertQuestion.run(id, topic, subtopic, level, type, JSON.stringify(tags), title, answer, code, index + 1);
});

const insertRole = db.prepare("insert into roles(title, sort_order) values (?, ?)");
const insertTech = db.prepare("insert or ignore into technologies(title) values (?)");
const getRole = db.prepare("select id from roles where title = ?");
const getTech = db.prepare("select id from technologies where title = ?");
const insertRoleTech = db.prepare("insert into role_technologies values (?, ?, ?)");

Object.entries(roleTechnologies).forEach(([role, technologies], roleIndex) => {
  insertRole.run(role, roleIndex + 1);
  const roleId = getRole.get(role).id;
  technologies.forEach((technology, techIndex) => {
    insertTech.run(technology);
    insertRoleTech.run(roleId, getTech.get(technology).id, techIndex + 1);
  });
});

function hashPassword(password, salt = crypto.randomBytes(16).toString("base64url")) {
  return {
    salt,
    hash: crypto.pbkdf2Sync(password, salt, 120000, 32, "sha256").toString("base64url")
  };
}

const adminPassword = "admin12345";
const admin = hashPassword(adminPassword);
db.prepare("insert into users(email, name, password_hash, password_salt, account_role) values (?, ?, ?, ?, ?)").run(
  "admin@example.com",
  "Administrator",
  admin.hash,
  admin.salt,
  "admin"
);

db.close();
console.log(`Seeded SQLite database: ${dbPath}`);
console.log("Admin account: admin@example.com / admin12345");
