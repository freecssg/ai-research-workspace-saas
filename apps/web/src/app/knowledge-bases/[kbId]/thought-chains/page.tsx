import { KnowledgeBaseThoughtChainsClient } from "@/features/knowledge-bases/kb-pages";

export default async function KnowledgeBaseThoughtChainsPage({
  params,
}: {
  params: Promise<{ kbId: string }>;
}) {
  const { kbId } = await params;
  return <KnowledgeBaseThoughtChainsClient kbId={kbId} />;
}
