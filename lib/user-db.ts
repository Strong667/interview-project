import "server-only";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import type { InterviewQuestion, PlanItem } from "@/lib/data";

export type User = {
  id: number;
  email: string;
  name: string;
  accountRole: "user" | "admin";
  role: string | null;
  stack: string | null;
  level: string | null;
  createdAt: string;
};

export type AdminUserRow = User & {
  stats: {
    progress: number;
    known: number;
    saved: number;
    plans: number;
    quizzes: number;
    accuracy: number;
  };
};

type UserRow = {
  id: number;
  email: string;
  name: string;
  account_role: "user" | "admin";
  role: string | null;
  stack: string | null;
  level: string | null;
  created_at: string;
};

type AuthUserRow = UserRow & {
  password_hash: string;
  password_salt: string;
};

type SavedQuestionRow = {
  id: string;
  topic: string;
  subtopic: string;
  level: "Junior" | "Middle" | "Senior";
  type: "theory" | "practice" | "code";
  tags: string;
  question: string;
  answer: string;
  code: string | null;
};

const dbPath = path.join(process.cwd(), "data", "interview.db");

function getDb() {
  const db = new DatabaseSync(dbPath);
  db.exec("pragma foreign_keys = on");
  ensureUserTables(db);
  return db;
}

function ensureUserTables(db: DatabaseSync) {
  db.exec(`
    create table if not exists users (
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

    create table if not exists saved_questions (
      user_id integer not null references users(id) on delete cascade,
      question_id text not null references questions(id) on delete cascade,
      created_at text not null default current_timestamp,
      primary key (user_id, question_id)
    );

    create table if not exists question_progress (
      user_id integer not null references users(id) on delete cascade,
      question_id text not null references questions(id) on delete cascade,
      status text not null check(status in ('known', 'unknown')),
      updated_at text not null default current_timestamp,
      primary key (user_id, question_id)
    );

    create table if not exists prep_plans (
      id integer primary key autoincrement,
      user_id integer not null references users(id) on delete cascade,
      role text not null,
      level text not null,
      urgency text not null,
      technologies text not null,
      plan text not null,
      created_at text not null default current_timestamp
    );

    create table if not exists quiz_results (
      id integer primary key autoincrement,
      user_id integer not null references users(id) on delete cascade,
      topic text not null references directions(slug) on delete cascade,
      score integer not null,
      total integer not null,
      weak_topics text not null,
      created_at text not null default current_timestamp
    );
  `);

  const columns = db.prepare("pragma table_info(users)").all() as { name: string }[];
  if (!columns.some((column) => column.name === "account_role")) {
    db.exec("alter table users add column account_role text not null default 'user'");
  }
}

function mapUser(row: UserRow): User {
  return {
    id: row.id,
    email: row.email,
    name: row.name,
    accountRole: row.account_role,
    role: row.role,
    stack: row.stack,
    level: row.level,
    createdAt: row.created_at
  };
}

function parseTags(value: string) {
  return JSON.parse(value) as string[];
}

function mapQuestion(row: SavedQuestionRow): InterviewQuestion {
  return {
    id: row.id,
    topic: row.topic,
    subtopic: row.subtopic,
    level: row.level,
    type: row.type,
    tags: parseTags(row.tags),
    question: row.question,
    answer: row.answer,
    code: row.code ?? undefined
  };
}

export function createUser(input: { email: string; name: string; passwordHash: string; passwordSalt: string; accountRole?: "user" | "admin" }) {
  const db = getDb();
  try {
    db.prepare("insert into users(email, name, password_hash, password_salt, account_role) values (?, ?, ?, ?, ?)").run(
      input.email.toLowerCase(),
      input.name,
      input.passwordHash,
      input.passwordSalt,
      input.accountRole ?? "user"
    );
    const row = db.prepare("select * from users where email = ?").get(input.email.toLowerCase()) as UserRow;
    return mapUser(row);
  } finally {
    db.close();
  }
}

export function addQuestion(input: {
  id: string;
  topic: string;
  subtopic: string;
  level: "Junior" | "Middle" | "Senior";
  type: "theory" | "practice" | "code";
  tags: string[];
  question: string;
  answer: string;
  code: string | null;
}) {
  const db = getDb();
  try {
    const direction = db.prepare("select slug from directions where slug = ?").get(input.topic) as { slug: string } | undefined;
    if (!direction) throw new Error("UNKNOWN_TOPIC");

    const existing = db.prepare("select id from questions where id = ?").get(input.id);
    if (existing) throw new Error("DUPLICATE_QUESTION");

    const maxOrder = db.prepare("select coalesce(max(sort_order), 0) as n from questions").get() as { n: number };
    db.prepare("insert into questions values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)").run(
      input.id,
      input.topic,
      input.subtopic,
      input.level,
      input.type,
      JSON.stringify(input.tags),
      input.question,
      input.answer,
      input.code,
      maxOrder.n + 1
    );

    const topicExists = db.prepare("select id from direction_topics where direction_slug = ? and title = ?").get(input.topic, input.subtopic);
    if (!topicExists) {
      const topicOrder = db.prepare("select coalesce(max(sort_order), 0) as n from direction_topics where direction_slug = ?").get(input.topic) as { n: number };
      db.prepare("insert into direction_topics(direction_slug, title, sort_order) values (?, ?, ?)").run(input.topic, input.subtopic, topicOrder.n + 1);
    }
  } finally {
    db.close();
  }
}

export function getAuthUserByEmail(email: string) {
  const db = getDb();
  try {
    return db.prepare("select * from users where email = ?").get(email.toLowerCase()) as AuthUserRow | undefined;
  } finally {
    db.close();
  }
}

export function getUserById(id: number) {
  const db = getDb();
  try {
    const row = db.prepare("select * from users where id = ?").get(id) as UserRow | undefined;
    return row ? mapUser(row) : null;
  } finally {
    db.close();
  }
}

export function updateUserProfile(userId: number, input: { name: string; role: string; stack: string; level: string }) {
  const db = getDb();
  try {
    db.prepare("update users set name = ?, role = ?, stack = ?, level = ? where id = ?").run(input.name, input.role, input.stack, input.level, userId);
    return getUserById(userId);
  } finally {
    db.close();
  }
}

export function listUsersForAdmin(): AdminUserRow[] {
  const db = getDb();
  try {
    const rows = db.prepare("select * from users order by created_at desc, id desc").all() as UserRow[];
    return rows.map((row) => {
      const user = mapUser(row);
      const progress = db.prepare("select count(*) as n from question_progress where user_id = ?").get(user.id) as { n: number };
      const known = db.prepare("select count(*) as n from question_progress where user_id = ? and status = 'known'").get(user.id) as { n: number };
      const saved = db.prepare("select count(*) as n from saved_questions where user_id = ?").get(user.id) as { n: number };
      const plans = db.prepare("select count(*) as n from prep_plans where user_id = ?").get(user.id) as { n: number };
      const quizzes = db.prepare("select count(*) as n from quiz_results where user_id = ?").get(user.id) as { n: number };
      const accuracy = progress.n > 0 ? Math.round((known.n / progress.n) * 100) : 0;
      return { ...user, stats: { progress: progress.n, known: known.n, saved: saved.n, plans: plans.n, quizzes: quizzes.n, accuracy } };
    });
  } finally {
    db.close();
  }
}

export function updateUserByAdmin(
  userId: number,
  input: { name: string; email: string; accountRole: "user" | "admin"; role: string; stack: string; level: string }
) {
  const db = getDb();
  try {
    db.prepare("update users set name = ?, email = ?, account_role = ?, role = ?, stack = ?, level = ? where id = ?").run(
      input.name,
      input.email.toLowerCase(),
      input.accountRole,
      input.role,
      input.stack,
      input.level,
      userId
    );
  } finally {
    db.close();
  }
}

export function updateUserPassword(userId: number, input: { passwordHash: string; passwordSalt: string }) {
  const db = getDb();
  try {
    db.prepare("update users set password_hash = ?, password_salt = ? where id = ?").run(input.passwordHash, input.passwordSalt, userId);
  } finally {
    db.close();
  }
}

export function deleteUserByAdmin(userId: number) {
  const db = getDb();
  try {
    db.prepare("delete from users where id = ?").run(userId);
  } finally {
    db.close();
  }
}

export function getSavedQuestionIds(userId: number) {
  const db = getDb();
  try {
    const rows = db.prepare("select question_id from saved_questions where user_id = ?").all(userId) as { question_id: string }[];
    return rows.map((row) => row.question_id);
  } finally {
    db.close();
  }
}

export function setSavedQuestion(userId: number, questionId: string, saved: boolean) {
  const db = getDb();
  try {
    if (saved) {
      db.prepare("insert or ignore into saved_questions(user_id, question_id) values (?, ?)").run(userId, questionId);
    } else {
      db.prepare("delete from saved_questions where user_id = ? and question_id = ?").run(userId, questionId);
    }
  } finally {
    db.close();
  }
}

export function setQuestionProgress(userId: number, questionId: string, status: "known" | "unknown") {
  const db = getDb();
  try {
    db.prepare(
      `insert into question_progress(user_id, question_id, status, updated_at)
       values (?, ?, ?, current_timestamp)
       on conflict(user_id, question_id) do update set status = excluded.status, updated_at = current_timestamp`
    ).run(userId, questionId, status);
  } finally {
    db.close();
  }
}

export function getKnownQuestionIds(userId: number) {
  const db = getDb();
  try {
    const rows = db.prepare("select question_id from question_progress where user_id = ? and status = 'known'").all(userId) as { question_id: string }[];
    return rows.map((row) => row.question_id);
  } finally {
    db.close();
  }
}

export function savePlan(userId: number, input: { role: string; level: string; urgency: string; technologies: string[]; plan: PlanItem[] }) {
  const db = getDb();
  try {
    db.prepare("insert into prep_plans(user_id, role, level, urgency, technologies, plan) values (?, ?, ?, ?, ?, ?)").run(
      userId,
      input.role,
      input.level,
      input.urgency,
      JSON.stringify(input.technologies),
      JSON.stringify(input.plan)
    );
  } finally {
    db.close();
  }
}

export function saveQuizResult(userId: number, input: { topic: string; score: number; total: number; weakTopics: string[] }) {
  const db = getDb();
  try {
    db.prepare("insert into quiz_results(user_id, topic, score, total, weak_topics) values (?, ?, ?, ?, ?)").run(
      userId,
      input.topic,
      input.score,
      input.total,
      JSON.stringify(input.weakTopics)
    );
  } finally {
    db.close();
  }
}

export function getUserStats(userId: number) {
  const db = getDb();
  try {
    const progress = db.prepare("select count(*) as n from question_progress where user_id = ?").get(userId) as { n: number };
    const known = db.prepare("select count(*) as n from question_progress where user_id = ? and status = 'known'").get(userId) as { n: number };
    const saved = db.prepare("select count(*) as n from saved_questions where user_id = ?").get(userId) as { n: number };
    const plans = db.prepare("select count(*) as n from prep_plans where user_id = ?").get(userId) as { n: number };
    const quizzes = db.prepare("select count(*) as n from quiz_results where user_id = ?").get(userId) as { n: number };
    const accuracy = progress.n > 0 ? Math.round((known.n / progress.n) * 100) : 0;

    return { progress: progress.n, known: known.n, saved: saved.n, plans: plans.n, quizzes: quizzes.n, accuracy };
  } finally {
    db.close();
  }
}

export function getSavedQuestions(userId: number) {
  const db = getDb();
  try {
    const rows = db
      .prepare(
        `select q.*
         from saved_questions sq
         join questions q on q.id = sq.question_id
         where sq.user_id = ?
         order by sq.created_at desc`
      )
      .all(userId) as SavedQuestionRow[];
    return rows.map(mapQuestion);
  } finally {
    db.close();
  }
}

export function getRecentActivity(userId: number) {
  const db = getDb();
  try {
    const rows = db
      .prepare(
        `select 'Вопрос: ' || q.subtopic || ' - ' || qp.status as title, qp.updated_at as created_at
         from question_progress qp
         join questions q on q.id = qp.question_id
         where qp.user_id = ?
         union all
         select 'Квиз: ' || topic || ' - ' || score || '/' || total as title, created_at
         from quiz_results
         where user_id = ?
         union all
         select 'План: ' || role || ' - ' || level as title, created_at
         from prep_plans
         where user_id = ?
         order by created_at desc
         limit 6`
      )
      .all(userId, userId, userId) as { title: string; created_at: string }[];
    return rows;
  } finally {
    db.close();
  }
}

export function getUserPlans(userId: number) {
  const db = getDb();
  try {
    return db
      .prepare(
        `select id, role, level, urgency, technologies, plan, created_at
         from prep_plans
         where user_id = ?
         order by created_at desc
         limit 5`
      )
      .all(userId) as {
      id: number;
      role: string;
      level: string;
      urgency: string;
      technologies: string;
      plan: string;
      created_at: string;
    }[];
  } finally {
    db.close();
  }
}

export function getQuizResults(userId: number) {
  const db = getDb();
  try {
    return db
      .prepare(
        `select qr.id, d.title as topic, qr.score, qr.total, qr.weak_topics, qr.created_at
         from quiz_results qr
         join directions d on d.slug = qr.topic
         where qr.user_id = ?
         order by qr.created_at desc
         limit 5`
      )
      .all(userId) as {
      id: number;
      topic: string;
      score: number;
      total: number;
      weak_topics: string;
      created_at: string;
    }[];
  } finally {
    db.close();
  }
}
