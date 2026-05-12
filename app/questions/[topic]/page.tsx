import { notFound } from "next/navigation";
import { QuestionsClient } from "@/components/questions-client";
import { getCurrentUser } from "@/lib/auth";
import { getDirection, getQuestionsByTopic } from "@/lib/db";
import { getKnownQuestionIds, getSavedQuestionIds } from "@/lib/user-db";

export default async function QuestionsPage({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const user = await getCurrentUser();
  const direction = getDirection(topic);
  if (!direction) notFound();

  return (
    <QuestionsClient
      direction={direction}
      questions={getQuestionsByTopic(topic)}
      initialSaved={user ? getSavedQuestionIds(user.id) : []}
      initialKnown={user ? getKnownQuestionIds(user.id) : []}
      isAuthenticated={Boolean(user)}
    />
  );
}
