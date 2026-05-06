import { KnowledgeBaseDetailClient } from "@/features/knowledge-bases/kb-pages";

export default async function KnowledgeBaseDetailPage({
  params,
}: {
  params: Promise<{ kbId: string }>;
}) {
  const { kbId } = await params;
  return <KnowledgeBaseDetailClient kbId={kbId} />;
}
