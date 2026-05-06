import { KnowledgeBaseWorkspaceNewPlaceholderClient } from "@/features/knowledge-bases/kb-pages";

export default async function NewKnowledgeBaseWorkspacePage({
  params,
}: {
  params: Promise<{ kbId: string }>;
}) {
  const { kbId } = await params;
  return <KnowledgeBaseWorkspaceNewPlaceholderClient kbId={kbId} />;
}
