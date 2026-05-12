import "server-only";
import path from "path";
import { DatabaseSync } from "node:sqlite";
import type { Direction, InterviewQuestion, Level, QuestionType, RoleTech } from "@/lib/data";

type DirectionRow = {
  slug: string;
  title: string;
  icon: string;
  question_target: number;
  description: string;
  topics: string | null;
};

type QuestionRow = {
  id: string;
  topic: string;
  subtopic: string;
  level: Level;
  type: QuestionType;
  tags: string;
  question: string;
  answer: string;
  code: string | null;
};

type RoleTechRow = {
  role: string;
  technologies: string;
};

const dbPath = path.join(process.cwd(), "data", "interview.db");

function getDb() {
  return new DatabaseSync(dbPath, { readOnly: true });
}

function parseList(value: string | null) {
  if (!value) return [];
  return JSON.parse(value) as string[];
}

function mapDirection(row: DirectionRow): Direction {
  return {
    slug: row.slug,
    title: row.title,
    icon: row.icon,
    questions: row.question_target,
    topics: parseList(row.topics),
    description: row.description
  };
}

function mapQuestion(row: QuestionRow): InterviewQuestion {
  return {
    id: row.id,
    topic: row.topic,
    subtopic: row.subtopic,
    level: row.level,
    type: row.type,
    tags: parseList(row.tags),
    question: row.question,
    answer: row.answer,
    code: row.code ?? undefined
  };
}

export function getDirections(): Direction[] {
  const db = getDb();
  try {
    const rows = db
      .prepare(
        `select d.*, json_group_array(dt.title) as topics
         from directions d
         left join direction_topics dt on dt.direction_slug = d.slug
         group by d.slug
         order by d.sort_order`
      )
      .all() as DirectionRow[];

    return rows.map(mapDirection);
  } finally {
    db.close();
  }
}

export function getDirection(slug: string): Direction | null {
  const db = getDb();
  try {
    const row = db
      .prepare(
        `select d.*, json_group_array(dt.title) as topics
         from directions d
         left join direction_topics dt on dt.direction_slug = d.slug
         where d.slug = ?
         group by d.slug`
      )
      .get(slug) as DirectionRow | undefined;

    return row ? mapDirection(row) : null;
  } finally {
    db.close();
  }
}

export function getQuestionsByTopic(topic: string): InterviewQuestion[] {
  const db = getDb();
  try {
    const rows = db.prepare("select * from questions where topic = ? order by sort_order").all(topic) as QuestionRow[];
    return rows.map(mapQuestion);
  } finally {
    db.close();
  }
}

export function getRoleTech(): RoleTech[] {
  const db = getDb();
  try {
    const rows = db
      .prepare(
        `select r.title as role, json_group_array(t.title) as technologies
         from roles r
         left join role_technologies rt on rt.role_id = r.id
         left join technologies t on t.id = rt.technology_id
         group by r.id
         order by r.sort_order`
      )
      .all() as RoleTechRow[];

    return rows.map((row) => ({ role: row.role, technologies: parseList(row.technologies).filter(Boolean) }));
  } finally {
    db.close();
  }
}
