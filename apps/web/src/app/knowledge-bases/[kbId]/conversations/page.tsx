import { KnowledgeBaseConversationsClient } from "@/features/knowledge-bases/kb-pages";

export default async function KnowledgeBaseConversationsPage({
  params,
}: {
  params: Promise<{ kbId: string }>;
}) {
  const { kbId } = await params;
  return <KnowledgeBaseConversationsClient kbId={kbId} />;
}
