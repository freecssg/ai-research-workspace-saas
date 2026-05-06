import { KnowledgeBaseMaterialsClient } from "@/features/knowledge-bases/kb-pages";

export default async function KnowledgeBaseMaterialsPage({
  params,
}: {
  params: Promise<{ kbId: string }>;
}) {
  const { kbId } = await params;
  return <KnowledgeBaseMaterialsClient kbId={kbId} />;
}
