import { KnowledgeBaseWorkspacesClient } from "@/features/knowledge-bases/kb-pages";

export default async function KnowledgeBaseWorkspacesPage({
  params,
}: {
  params: Promise<{ kbId: string }>;
}) {
  const { kbId } = await params;
  return <KnowledgeBaseWorkspacesClient kbId={kbId} />;
}
