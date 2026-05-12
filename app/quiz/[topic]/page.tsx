import { notFound } from "next/navigation";
import { QuizClient } from "@/components/quiz-client";
import { getCurrentUser } from "@/lib/auth";
import { getDirection, getQuestionsByTopic } from "@/lib/db";

export default async function QuizPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const user = await getCurrentUser();
  const direction = getDirection(topic);
  const questions = getQuestionsByTopic(topic);
  if (!direction || !questions.length) notFound();

  return <QuizClient topic={topic} direction={direction} questions={questions} isAuthenticated={Boolean(user)} />;
}
