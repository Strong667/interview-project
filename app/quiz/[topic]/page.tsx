import { QuizClient } from "@/components/quiz-client";
import { getCurrentUser } from "@/lib/auth";
import { getDirection, getQuestionsByTopic } from "@/lib/db";

export default async function QuizPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const user = await getCurrentUser();
  return <QuizClient topic={topic} direction={getDirection(topic)} questions={getQuestionsByTopic(topic)} isAuthenticated={Boolean(user)} />;
}
