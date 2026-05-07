"use client";

import { useRouter } from "next/navigation";
import {
  Bot,
  Camera,
  FileText,
  Pencil,
  Plug,
  RefreshCcw,
  Trash2,
  User,
  Users,
} from "lucide-react";
import {
  type FormEvent,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { AppShell } from "@/components/layout/app-shell";
import { PageContainer } from "@/components/layout/page-container";
import { PageHeader } from "@/components/layout/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { ApiClientError } from "@/lib/api-client";
import { clearAuthSession, getStoredAccessToken, type AuthUser } from "@/lib/auth-client";
import {
  addProjectTeamMember,
  listProjectTeam,
  listProjects,
  removeProjectTeamMember,
  updateProjectTeamMember,
  type ProjectMemberRole,
  type ProjectRead,
  type ProjectTeamMemberRead,
} from "@/features/projects/project-api";
import {
  ErrorState,
  LoadingSkeleton,
} from "@/features/knowledge-bases/kb-components";

import {
  changePassword,
  getCurrentUser,
  listAdminUsers,
} from "./settings-api";
import {
  ActionFooter,
  FormLabel,
  InlineNotice,
  IntegrationCard,
  MaskedSecretInput,
  ProfileSectionCard,
} from "./settings-components";

type ProfileState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: ProfileData };

type ProfileData = {
  currentUser: AuthUser;
  projects: ProjectRead[];
  teamsByProject: Record<string, ProjectTeamMemberRead[]>;
  users: AuthUser[];
  userLookupAvailable: boolean;
  userLookupMessage?: string;
};

const roleOptions: ProjectMemberRole[] = ["leader", "editor", "viewer"];

function shortId(id: string) {
  return `${id.slice(0, 8)}...`;
}

function memberLabel(userId: string, users: AuthUser[], currentUser: AuthUser) {
  if (userId === currentUser.id) {
    return `${currentUser.name} (you)`;
  }

  const user = users.find((item) => item.id === userId);
  return user ? user.name : `User ${shortId(userId)}`;
}

function roleLabel(role: ProjectMemberRole) {
  return role.charAt(0).toUpperCase() + role.slice(1);
}

function canManageProjectTeam(
  currentUser: AuthUser,
  project: ProjectRead,
  team: ProjectTeamMemberRead[],
) {
  if (currentUser.role === "admin" || project.created_by_id === currentUser.id) {
    return true;
  }

  return team.some(
    (member) => member.user_id === currentUser.id && member.member_role === "leader",
  );
}

function useProfileData(): [ProfileState, () => void] {
  const router = useRouter();
  const [state, setState] = useState<ProfileState>({ status: "loading" });

  const load = useCallback(() => {
    if (!getStoredAccessToken()) {
      router.replace("/login");
      return;
    }

    setState({ status: "loading" });

    void (async () => {
      try {
        const [currentUser, projects] = await Promise.all([
          getCurrentUser(),
          listProjects(),
        ]);

        const teamResults = await Promise.allSettled(
          projects.map(async (project) => ({
            projectId: project.id,
            team: await listProjectTeam(project.id),
          })),
        );
        const teamsByProject: Record<string, ProjectTeamMemberRead[]> = {};
        teamResults.forEach((result) => {
          if (result.status === "fulfilled") {
            teamsByProject[result.value.projectId] = result.value.team;
          }
        });

        let users: AuthUser[] = [];
        let userLookupAvailable = false;
        let userLookupMessage: string | undefined =
          "User lookup is admin-only in the current backend, so non-admin project leaders cannot select from the full lab roster yet.";

        try {
          users = await listAdminUsers();
          userLookupAvailable = true;
          userLookupMessage = undefined;
        } catch (error) {
          if (error instanceof ApiClientError && error.status === 401) {
            clearAuthSession();
            router.replace("/login");
            return;
          }
        }

        setState({
          status: "ready",
          data: {
            currentUser,
            projects,
            teamsByProject,
            users,
            userLookupAvailable,
            userLookupMessage,
          },
        });
      } catch (error) {
        if (error instanceof ApiClientError && error.status === 401) {
          clearAuthSession();
          router.replace("/login");
          return;
        }

        setState({
          status: "error",
          message:
            error instanceof Error
              ? error.message
              : "Unable to load profile information.",
        });
      }
    })();
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  return [state, load];
}

function PasswordDialog({
  onClose,
  onChanged,
}: {
  onClose: () => void;
  onChanged: () => void;
}) {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    if (!currentPassword || !newPassword) {
      setError("Current password and new password are required.");
      return;
    }

    if (newPassword.length < 8) {
      setError("New password must be at least 8 characters.");
      return;
    }

    setIsSaving(true);
    try {
      await changePassword({
        current_password: currentPassword,
        new_password: newPassword,
      });
      onChanged();
      onClose();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to change password.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-5">
      <Card className="w-full max-w-lg p-6 shadow-panel">
        <h2 className="text-2xl font-extrabold">Change password</h2>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Enter your current password and choose a new local lab password.
        </p>
        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormLabel label="Current Password">
            <Input
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(event) => setCurrentPassword(event.target.value)}
            />
          </FormLabel>
          <FormLabel label="New Password">
            <Input
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
            />
          </FormLabel>
          {error ? <InlineNotice tone="red">{error}</InlineNotice> : null}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Update Password"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function ProjectTeamManagementCard({
  data,
  onReload,
}: {
  data: ProfileData;
  onReload: () => void;
}) {
  const manageableProjects = useMemo(
    () =>
      data.projects.filter((project) =>
        canManageProjectTeam(
          data.currentUser,
          project,
          data.teamsByProject[project.id] ?? [],
        ),
      ),
    [data],
  );
  const [projectId, setProjectId] = useState(manageableProjects[0]?.id ?? "");
  const [newUserId, setNewUserId] = useState("");
  const [newRole, setNewRole] = useState<ProjectMemberRole>("viewer");
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!projectId && manageableProjects[0]) {
      setProjectId(manageableProjects[0].id);
    }
  }, [manageableProjects, projectId]);

  const selectedProject = manageableProjects.find((project) => project.id === projectId);
  const selectedTeam = selectedProject
    ? data.teamsByProject[selectedProject.id] ?? []
    : [];
  const availableUsers = data.users.filter(
    (user) => !selectedTeam.some((member) => member.user_id === user.id),
  );

  async function addMember() {
    setMessage(null);
    setError(null);

    if (!selectedProject || !newUserId) {
      setError("Select a project and lab user before adding a member.");
      return;
    }

    setIsSaving(true);
    try {
      await addProjectTeamMember(selectedProject.id, {
        user_id: newUserId,
        member_role: newRole,
      });
      setMessage("Project team member added.");
      setNewUserId("");
      onReload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to add this project team member.",
      );
    } finally {
      setIsSaving(false);
    }
  }

  async function updateMember(userId: string, memberRole: ProjectMemberRole) {
    if (!selectedProject) {
      return;
    }

    setMessage(null);
    setError(null);
    try {
      await updateProjectTeamMember(selectedProject.id, userId, { member_role: memberRole });
      setMessage("Project team role updated.");
      onReload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to update this member.",
      );
    }
  }

  async function removeMember(userId: string) {
    if (!selectedProject) {
      return;
    }

    setMessage(null);
    setError(null);
    try {
      await removeProjectTeamMember(selectedProject.id, userId);
      setMessage("Project team member removed.");
      onReload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to remove this member.",
      );
    }
  }

  return (
    <ProfileSectionCard icon={<Users className="h-6 w-6" />} title="Team Management">
      <p className="text-sm leading-6 text-muted-foreground">
        Manage members for projects you own.
      </p>

      {manageableProjects.length === 0 ? (
        <div className="mt-5">
          <EmptyState
            icon={<Users className="h-8 w-8" />}
            title="No owned projects yet"
            description="Create a project first; the creator is added as the project leader."
          />
        </div>
      ) : (
        <div className="mt-5 space-y-5">
          <FormLabel label="Owned / led Project">
            <Select value={projectId} onChange={(event) => setProjectId(event.target.value)}>
              {manageableProjects.map((project) => (
                <option key={project.id} value={project.id}>
                  {project.name}
                </option>
              ))}
            </Select>
          </FormLabel>

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-3">
              <h3 className="text-sm font-semibold">Current Project Team</h3>
              <Badge tone="blue">{selectedTeam.length} members</Badge>
            </div>
            {selectedTeam.length === 0 ? (
              <p className="rounded-md border bg-white px-4 py-3 text-sm text-muted-foreground">
                No project team members are recorded yet.
              </p>
            ) : (
              <div className="space-y-2">
                {selectedTeam.map((member) => (
                  <div
                    key={member.id}
                    className="grid gap-3 rounded-md border bg-white p-3 md:grid-cols-[1fr_132px_40px] md:items-center"
                  >
                    <div className="min-w-0">
                      <p className="truncate font-semibold">
                        {memberLabel(member.user_id, data.users, data.currentUser)}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">
                        {data.users.find((user) => user.id === member.user_id)?.email ??
                          shortId(member.user_id)}
                      </p>
                    </div>
                    <Select
                      value={member.member_role}
                      onChange={(event) =>
                        updateMember(member.user_id, event.target.value as ProjectMemberRole)
                      }
                      aria-label="Project team role"
                    >
                      {roleOptions.map((role) => (
                        <option key={role} value={role}>
                          {roleLabel(role)}
                        </option>
                      ))}
                    </Select>
                    <IconButton
                      icon={<Trash2 className="h-4 w-4" />}
                      label="Remove member"
                      tone="danger"
                      onClick={() => removeMember(member.user_id)}
                      disabled={member.user_id === data.currentUser.id}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          {data.userLookupAvailable ? (
            <div className="rounded-md border bg-white p-4">
              <h3 className="font-semibold">Add member</h3>
              <div className="mt-3 grid gap-3 md:grid-cols-[1fr_130px_auto] md:items-end">
                <FormLabel label="Lab user">
                  <Select
                    value={newUserId}
                    onChange={(event) => setNewUserId(event.target.value)}
                  >
                    <option value="">Select a user...</option>
                    {availableUsers.map((user) => (
                      <option key={user.id} value={user.id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </Select>
                </FormLabel>
                <FormLabel label="Role">
                  <Select
                    value={newRole}
                    onChange={(event) => setNewRole(event.target.value as ProjectMemberRole)}
                  >
                    {roleOptions.map((role) => (
                      <option key={role} value={role}>
                        {roleLabel(role)}
                      </option>
                    ))}
                  </Select>
                </FormLabel>
                <Button type="button" onClick={addMember} disabled={isSaving}>
                  Add
                </Button>
              </div>
            </div>
          ) : (
            <InlineNotice tone="amber">
              {data.userLookupMessage}
            </InlineNotice>
          )}

          {message ? <InlineNotice tone="green">{message}</InlineNotice> : null}
          {error ? <InlineNotice tone="red">{error}</InlineNotice> : null}
        </div>
      )}
    </ProfileSectionCard>
  );
}

function ProfileReady({ data, onReload }: { data: ProfileData; onReload: () => void }) {
  const [name, setName] = useState(data.currentUser.name);
  const [email, setEmail] = useState(data.currentUser.email);
  const [openclawKey, setOpenclawKey] = useState("sk-local-openclaw-draft");
  const [zoteroKey, setZoteroKey] = useState("zotero-local-draft-key");
  const [zoteroLibraryId, setZoteroLibraryId] = useState("9876543");
  const [obsidianPath, setObsidianPath] = useState(
    "/Users/eanderson/Documents/Obsidian",
  );
  const [showOpenclaw, setShowOpenclaw] = useState(false);
  const [showZotero, setShowZotero] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  function resetDrafts() {
    setName(data.currentUser.name);
    setEmail(data.currentUser.email);
    setOpenclawKey("sk-local-openclaw-draft");
    setZoteroKey("zotero-local-draft-key");
    setZoteroLibraryId("9876543");
    setObsidianPath("/Users/eanderson/Documents/Obsidian");
    setMessage("Local profile drafts were reset.");
  }

  function saveDrafts() {
    setMessage(
      "Profile and integration fields are local-only drafts until a settings API is added.",
    );
  }

  return (
    <>
      <PageHeader
        title="User Profile"
        description="Manage your account settings, team preferences, and tool integrations."
      />
      <div className="grid gap-8 xl:grid-cols-[430px_1fr]">
        <div className="space-y-6">
          <ProfileSectionCard icon={<User className="h-6 w-6" />} title="Account Information">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div className="flex h-28 w-28 items-center justify-center rounded-full border border-blue-100 bg-gradient-to-b from-blue-50 to-white text-muted-foreground">
                  <User className="h-16 w-16" />
                </div>
                <span className="absolute bottom-1 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-primary text-white shadow-soft">
                  <Camera className="h-5 w-5" />
                </span>
              </div>
              <p className="mt-3 text-sm text-muted-foreground">Click to change photo</p>
            </div>

            <div className="mt-6 space-y-4">
              <FormLabel
                label="Username"
                hint="Profile update persistence is not backed by the current API."
              >
                <Input value={name} onChange={(event) => setName(event.target.value)} />
              </FormLabel>
              <FormLabel label="Email Address" hint="Email changes are read-only in this MVP.">
                <Input
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  readOnly
                  className="bg-blue-50/50"
                />
              </FormLabel>
              <Button
                type="button"
                variant="secondary"
                className="h-12 w-full"
                onClick={() => setShowPasswordDialog(true)}
              >
                <RefreshCcw className="h-4 w-4" />
                Reset Password
              </Button>
            </div>
          </ProfileSectionCard>

          <ProjectTeamManagementCard data={data} onReload={onReload} />
        </div>

        <div>
          <ProfileSectionCard icon={<Plug className="h-6 w-6" />} title="Personal Integrations">
            <p className="text-lg leading-8 text-muted-foreground">
              Connect external tools to streamline your research workflow and synchronize your data.
            </p>
            <div className="mt-8 space-y-6">
              <IntegrationCard
                icon={<Bot className="h-7 w-7" />}
                title="Openclaw API"
                description="Configure custom AI model access."
              >
                <MaskedSecretInput
                  visible={showOpenclaw}
                  onToggleVisible={() => setShowOpenclaw((value) => !value)}
                  value={openclawKey}
                  onChange={(event) => setOpenclawKey(event.target.value)}
                  aria-label="Openclaw API key"
                />
              </IntegrationCard>
              <IntegrationCard
                icon={<Pencil className="h-7 w-7" />}
                title="Obsidian Vault"
                description="Local markdown synchronization."
                tone="amber"
              >
                <Input
                  value={obsidianPath}
                  onChange={(event) => setObsidianPath(event.target.value)}
                  aria-label="Obsidian vault path"
                />
              </IntegrationCard>
              <IntegrationCard
                icon={<FileText className="h-7 w-7" />}
                title="Zotero Reference Manager"
                description="Sync citations and PDFs."
                tone="red"
              >
                <div className="grid gap-4 md:grid-cols-[1fr_0.82fr]">
                  <FormLabel label="API Key">
                    <MaskedSecretInput
                      visible={showZotero}
                      onToggleVisible={() => setShowZotero((value) => !value)}
                      value={zoteroKey}
                      onChange={(event) => setZoteroKey(event.target.value)}
                      aria-label="Zotero API key"
                    />
                  </FormLabel>
                  <FormLabel label="Library ID">
                    <Input
                      value={zoteroLibraryId}
                      onChange={(event) => setZoteroLibraryId(event.target.value)}
                    />
                  </FormLabel>
                </div>
              </IntegrationCard>
            </div>
          </ProfileSectionCard>
          {message ? <div className="mt-5"><InlineNotice tone="blue">{message}</InlineNotice></div> : null}
          <ActionFooter
            cancelLabel="Cancel"
            saveLabel="Save Changes"
            onCancel={resetDrafts}
            onSave={saveDrafts}
          />
        </div>
      </div>

      {showPasswordDialog ? (
        <PasswordDialog
          onClose={() => setShowPasswordDialog(false)}
          onChanged={() => setMessage("Password updated successfully.")}
        />
      ) : null}
    </>
  );
}

export function ProfilePageClient() {
  const [state, reload] = useProfileData();

  return (
    <AppShell>
      <PageContainer>
        {state.status === "loading" ? (
          <LoadingSkeleton variant="cards" />
        ) : state.status === "error" ? (
          <ErrorState message={state.message} onRetry={reload} />
        ) : (
          <ProfileReady data={state.data} onReload={reload} />
        )}
      </PageContainer>
    </AppShell>
  );
}
