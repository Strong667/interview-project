export type Level = "Junior" | "Middle" | "Senior";
export type QuestionType = "theory" | "practice" | "code";
export type Urgency = "urgent" | "normal" | "relaxed";

export type Direction = {
  slug: string;
  title: string;
  icon: string;
  questions: number;
  topics: string[];
  description: string;
};

export type InterviewQuestion = {
  id: string;
  topic: string;
  subtopic: string;
  level: Level;
  type: QuestionType;
  tags: string[];
  question: string;
  answer: string;
  code?: string;
};

export type RoleTech = {
  role: string;
  technologies: string[];
};

export type PlanItem = {
  title: string;
  priority: number;
  focus: string;
  duration: string;
  slug: string;
  role: string;
};

export const levelOptions: Level[] = ["Junior", "Middle", "Senior"];

export function buildPlan(
  role: string,
  technologies: string[],
  level: Level,
  urgency: Urgency,
  directions: Direction[]
): PlanItem[] {
  const urgencyBoost = urgency === "urgent" ? ["JavaScript", "Git", "Алгоритмы"] : ["System Design", "SQL", "TypeScript"];
  const selected = [...new Set([...technologies, ...urgencyBoost])];

  return selected.slice(0, 7).map((tech, index) => ({
    title: tech,
    priority: index + 1,
    focus: level === "Junior" ? "База и типовые вопросы" : level === "Middle" ? "Практика, trade-off и оптимизация" : "Архитектура, масштабирование и лидерство",
    duration: urgency === "urgent" ? "25-40 минут" : urgency === "normal" ? "1-2 часа" : "2-3 часа",
    slug: directions.find((item) => item.title.toLowerCase().includes(tech.toLowerCase().split(".")[0]))?.slug ?? "javascript",
    role
  }));
}
