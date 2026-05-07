import { WorkspaceNewClient } from "@/features/workspaces/workspace-pages";

export default async function NewKnowledgeBaseWorkspacePage({
  params,
}: {
  params: Promise<{ kbId: string }>;
}) {
  const { kbId } = await params;
  return <WorkspaceNewClient kbId={kbId} />;
}
