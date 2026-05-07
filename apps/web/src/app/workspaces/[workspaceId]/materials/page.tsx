import { WorkspaceMaterialsClient } from "@/features/workspaces/workspace-pages";

export default async function WorkspaceMaterialsPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceMaterialsClient workspaceId={workspaceId} />;
}
