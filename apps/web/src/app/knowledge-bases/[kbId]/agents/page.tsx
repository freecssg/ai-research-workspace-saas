import { KnowledgeBaseAgentsClient } from "@/features/knowledge-bases/kb-pages";

export default async function KnowledgeBaseAgentsPage({
  params,
}: {
  params: Promise<{ kbId: string }>;
}) {
  const { kbId } = await params;
  return <KnowledgeBaseAgentsClient kbId={kbId} />;
}
