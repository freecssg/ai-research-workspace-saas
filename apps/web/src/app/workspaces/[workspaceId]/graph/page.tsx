import { WorkspaceGraphClient } from "@/features/workspaces/workspace-pages";

export default async function WorkspaceGraphPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceGraphClient workspaceId={workspaceId} />;
}
