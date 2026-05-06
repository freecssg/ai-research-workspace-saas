import { KnowledgeBaseGraphClient } from "@/features/knowledge-bases/kb-pages";

export default async function KnowledgeBaseGraphPage({
  params,
}: {
  params: Promise<{ kbId: string }>;
}) {
  const { kbId } = await params;
  return <KnowledgeBaseGraphClient kbId={kbId} />;
}
