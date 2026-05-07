import { WorkspaceDetailClient } from "@/features/workspaces/workspace-pages";

export default async function WorkspaceDetailPage({
  params,
}: {
  params: Promise<{ workspaceId: string }>;
}) {
  const { workspaceId } = await params;
  return <WorkspaceDetailClient workspaceId={workspaceId} />;
}
