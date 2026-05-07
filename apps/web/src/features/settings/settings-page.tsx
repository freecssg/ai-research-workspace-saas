"use client";

import { useRouter } from "next/navigation";
import {
  Bot,
  CheckCircle2,
  ChevronUp,
  Folder,
  GraduationCap,
  Network,
  Shield,
  Upload,
  UserPlus,
  Users,
} from "lucide-react";
import {
  type FormEvent,
  type ReactNode,
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
import { StatusBadge } from "@/components/ui/status-badge";
import { ApiClientError } from "@/lib/api-client";
import { clearAuthSession, getStoredAccessToken, type AuthUser } from "@/lib/auth-client";
import {
  ErrorState,
  LoadingSkeleton,
} from "@/features/knowledge-bases/kb-components";

import {
  createAdminUser,
  deactivateAdminUser,
  getCurrentUser,
  listAdminUsers,
  LOCAL_LAB_DEFAULT_PASSWORD,
} from "./settings-api";
import {
  ActionFooter,
  FormLabel,
  InlineNotice,
  MaskedSecretInput,
  SettingsSectionCard,
  ToggleSwitch,
} from "./settings-components";

type SettingsState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; data: SettingsData };

type SettingsData = {
  currentUser: AuthUser;
  users: AuthUser[];
  userLoadError?: string;
};

function useSettingsData(): [SettingsState, () => void] {
  const router = useRouter();
  const [state, setState] = useState<SettingsState>({ status: "loading" });

  const load = useCallback(() => {
    if (!getStoredAccessToken()) {
      router.replace("/login");
      return;
    }

    setState({ status: "loading" });
    void (async () => {
      try {
        const currentUser = await getCurrentUser();
        let users: AuthUser[] = [];
        let userLoadError: string | undefined;

        if (currentUser.role === "admin") {
          try {
            users = await listAdminUsers();
          } catch (caughtError) {
            userLoadError =
              caughtError instanceof Error
                ? caughtError.message
                : "Unable to load lab users.";
          }
        }

        setState({ status: "ready", data: { currentUser, users, userLoadError } });
      } catch (caughtError) {
        if (caughtError instanceof ApiClientError && caughtError.status === 401) {
          clearAuthSession();
          router.replace("/login");
          return;
        }

        setState({
          status: "error",
          message:
            caughtError instanceof Error
              ? caughtError.message
              : "Unable to load settings.",
        });
      }
    })();
  }, [router]);

  useEffect(() => {
    load();
  }, [load]);

  return [state, load];
}

function AddUserDialog({
  onClose,
  onCreated,
}: {
  onClose: () => void;
  onCreated: (message: string) => void;
}) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim() || trimmedEmail.split("@")[0] || "Lab Member";

    if (!trimmedEmail || !trimmedEmail.includes("@")) {
      setError("Enter a valid lab email address.");
      return;
    }

    setIsSaving(true);
    try {
      await createAdminUser({
        email: trimmedEmail,
        name: trimmedName,
        password: LOCAL_LAB_DEFAULT_PASSWORD,
        role: "member",
        is_active: true,
      });
      onCreated("User added with the local lab default password.");
      onClose();
    } catch (caughtError) {
      const message =
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to add this lab user.";
      setError(
        message.includes("8")
          ? `${message} The current backend validates passwords as 8+ characters, while this UI is configured to send the required local default password.`
          : message,
      );
    } finally {
      setIsSaving(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 px-5">
      <Card className="w-full max-w-lg p-6 shadow-panel">
        <div className="flex items-center gap-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-md bg-blue-50 text-primary">
            <UserPlus className="h-6 w-6" />
          </span>
          <div>
            <h2 className="text-2xl font-extrabold">Add lab user</h2>
            <p className="text-sm text-muted-foreground">
              Create an internal account for the local research team.
            </p>
          </div>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <FormLabel label="Email address">
            <Input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="student@university.edu"
              autoComplete="off"
            />
          </FormLabel>
          <FormLabel
            label="Name"
            hint="Optional. If blank, the name is derived from the email prefix."
          >
            <Input
              value={name}
              onChange={(event) => setName(event.target.value)}
              placeholder="Student Name"
            />
          </FormLabel>
          <InlineNotice tone="blue">
            The account is created as an active member using the configured local lab default.
          </InlineNotice>
          {error ? <InlineNotice tone="red">{error}</InlineNotice> : null}
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Adding..." : "Add User"}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}

function UserManagementCard({
  currentUser,
  users,
  userLoadError,
  onReload,
}: {
  currentUser: AuthUser;
  users: AuthUser[];
  userLoadError?: string;
  onReload: () => void;
}) {
  const [showDialog, setShowDialog] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function deactivateUser(userId: string) {
    setMessage(null);
    setError(null);

    try {
      await deactivateAdminUser(userId);
      setMessage("User deactivated.");
      onReload();
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : "Unable to deactivate this user.",
      );
    }
  }

  if (currentUser.role !== "admin") {
    return (
      <Card className="p-6">
        <div className="flex items-center gap-4">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-primary">
            <Users className="h-5 w-5" />
          </span>
          <div>
            <h2 className="text-xl font-extrabold">User Management</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Admin-only local lab account management.
            </p>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <>
      <Card className="p-6">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-4">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-blue-50 text-primary">
              <Users className="h-5 w-5" />
            </span>
            <h2 className="truncate text-xl font-extrabold">
              User Management ({users.length})
            </h2>
          </div>
          <Button type="button" variant="secondary" onClick={() => setShowDialog(true)}>
            Add
          </Button>
        </div>
        {userLoadError ? (
          <div className="mt-4">
            <InlineNotice tone="red">{userLoadError}</InlineNotice>
          </div>
        ) : users.length === 0 ? (
          <div className="mt-5">
            <EmptyState
              icon={<Users className="h-8 w-8" />}
              title="No lab users loaded"
              description="Add internal users for the local research team."
            />
          </div>
        ) : (
          <div className="mt-5 space-y-2">
            {users.slice(0, 5).map((user) => (
              <div
                key={user.id}
                className="grid gap-3 rounded-md border bg-white p-3 md:grid-cols-[1fr_auto_auto] md:items-center"
              >
                <div className="min-w-0">
                  <p className="truncate font-semibold">{user.name}</p>
                  <p className="truncate text-xs text-muted-foreground">{user.email}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge tone={user.role === "admin" ? "blue" : "neutral"}>{user.role}</Badge>
                  <StatusBadge status={user.is_active ? "active" : "archived"} />
                </div>
                <IconButton
                  icon={<Shield className="h-4 w-4" />}
                  label="Deactivate user"
                  tone="danger"
                  disabled={user.id === currentUser.id || !user.is_active}
                  onClick={() => deactivateUser(user.id)}
                />
              </div>
            ))}
          </div>
        )}
        {message ? <div className="mt-4"><InlineNotice tone="green">{message}</InlineNotice></div> : null}
        {error ? <div className="mt-4"><InlineNotice tone="red">{error}</InlineNotice></div> : null}
      </Card>
      {showDialog ? (
        <AddUserDialog
          onClose={() => setShowDialog(false)}
          onCreated={(createdMessage) => {
            setMessage(createdMessage);
            onReload();
          }}
        />
      ) : null}
    </>
  );
}

function VectorOption({
  title,
  description,
  meta,
  selected,
  children,
}: {
  title: string;
  description: string;
  meta?: string;
  selected?: boolean;
  children?: ReactNode;
}) {
  return (
    <div
      className={
        selected
          ? "rounded-md border border-primary bg-blue-50/30 p-4"
          : "rounded-md border bg-white p-4"
      }
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="font-semibold">{title}</h3>
          <p className="mt-1 text-sm text-muted-foreground">{description}</p>
          {meta ? <p className="mt-2 text-sm font-medium text-muted-foreground">{meta}</p> : null}
        </div>
        <span
          className={
            selected
              ? "mt-1 h-4 w-4 rounded-full border-4 border-primary bg-white"
              : "mt-1 h-4 w-4 rounded-full border border-muted-foreground"
          }
        />
      </div>
      {children ? <div className="mt-3">{children}</div> : null}
    </div>
  );
}

function SettingsReady({ data, onReload }: { data: SettingsData; onReload: () => void }) {
  const [localInference, setLocalInference] = useState(true);
  const [localModel, setLocalModel] = useState("Llama-3-8B-Instruct (Ollama)");
  const [serverUrl, setServerUrl] = useState("http://localhost");
  const [port, setPort] = useState("11434");
  const [openaiKey, setOpenaiKey] = useState("sk-local-openai-draft");
  const [anthropicKey, setAnthropicKey] = useState("sk-ant-local-draft");
  const [showOpenai, setShowOpenai] = useState(false);
  const [showAnthropic, setShowAnthropic] = useState(false);
  const [downloadDir, setDownloadDir] = useState("~/Documents/ScholarFlow");
  const [renameTemplate, setRenameTemplate] = useState("{Year}_{FirstAuthor}_{Title}");
  const [citationFormat, setCitationFormat] = useState("APA 7th Edition");
  const [message, setMessage] = useState<string | null>(null);

  const previewName = useMemo(
    () =>
      renameTemplate
        .replace("{Year}", "2024")
        .replace("{FirstAuthor}", "Smith")
        .replace("{Title}", "AttentionIsAllYouNeed"),
    [renameTemplate],
  );

  function resetSettings() {
    setLocalInference(true);
    setLocalModel("Llama-3-8B-Instruct (Ollama)");
    setServerUrl("http://localhost");
    setPort("11434");
    setOpenaiKey("sk-local-openai-draft");
    setAnthropicKey("sk-ant-local-draft");
    setDownloadDir("~/Documents/ScholarFlow");
    setRenameTemplate("{Year}_{FirstAuthor}_{Title}");
    setCitationFormat("APA 7th Edition");
    setMessage("Local settings drafts were discarded.");
  }

  function saveSettings() {
    setMessage(
      "Settings are saved only in local page state until a system preferences API is added.",
    );
  }

  return (
    <>
      <PageHeader
        title="Preferences"
        description="Manage your AI configurations, database connections, and workspace rules."
        className="mb-6"
      />
      <div className="grid gap-8 xl:grid-cols-[1.22fr_0.65fr]">
        <div className="space-y-6">
          <SettingsSectionCard
            icon={<Bot className="h-6 w-6" />}
            title="AI Model Configuration"
            actions={<ChevronUp className="h-5 w-5 text-muted-foreground" />}
          >
            <div className="flex items-center justify-between gap-6">
              <h3 className="text-lg font-extrabold">Local AI Inference</h3>
              <ToggleSwitch
                checked={localInference}
                onChange={setLocalInference}
                label="Toggle local AI inference"
              />
            </div>
            <div className="mt-5 grid gap-5 md:grid-cols-[1.2fr_1.1fr_0.42fr]">
              <FormLabel label="Local Model">
                <Select
                  value={localModel}
                  onChange={(event) => setLocalModel(event.target.value)}
                >
                  <option>Llama-3-8B-Instruct (Ollama)</option>
                  <option>Mistral-7B-Instruct (Ollama)</option>
                  <option>Qwen2.5-7B-Instruct (Ollama)</option>
                </Select>
              </FormLabel>
              <FormLabel label="Server URL">
                <Input value={serverUrl} onChange={(event) => setServerUrl(event.target.value)} />
              </FormLabel>
              <FormLabel label="Port">
                <Input value={port} onChange={(event) => setPort(event.target.value)} />
              </FormLabel>
            </div>
            <div className="mt-4 flex items-center gap-2 text-sm font-semibold text-success">
              <CheckCircle2 className="h-5 w-5" />
              Connected to Ollama daemon
            </div>
            <div className="my-6 border-t" />
            <h3 className="text-lg font-extrabold">Public API Providers</h3>
            <div className="mt-4 space-y-4">
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <FormLabel label="OpenAI API Key">
                  <MaskedSecretInput
                    visible={showOpenai}
                    onToggleVisible={() => setShowOpenai((value) => !value)}
                    value={openaiKey}
                    onChange={(event) => setOpenaiKey(event.target.value)}
                  />
                </FormLabel>
                <Button type="button" variant="secondary" disabled title="No verification endpoint yet">
                  Verify
                </Button>
              </div>
              <div className="grid gap-3 md:grid-cols-[1fr_auto] md:items-end">
                <FormLabel label="Anthropic API Key">
                  <MaskedSecretInput
                    visible={showAnthropic}
                    onToggleVisible={() => setShowAnthropic((value) => !value)}
                    value={anthropicKey}
                    onChange={(event) => setAnthropicKey(event.target.value)}
                  />
                </FormLabel>
                <Button type="button" variant="secondary" disabled title="No verification endpoint yet">
                  Verify
                </Button>
              </div>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon={<Network className="h-6 w-6" />}
            title="Knowledge Base & RAG"
            actions={<ChevronUp className="h-5 w-5 text-muted-foreground" />}
          >
            <h3 className="text-lg font-extrabold">Vector Database Configuration</h3>
            <div className="mt-4 grid gap-5 md:grid-cols-2">
              <VectorOption
                title="Local ChromaDB"
                description="Stored locally in workspace directory."
                meta="~/.scholarflow/chroma_db"
                selected
              >
                <button type="button" className="text-sm font-semibold text-primary">
                  Manage Indexes
                </button>
              </VectorOption>
              <VectorOption
                title="Connect Pinecone"
                description="Cloud vector database for large scale research."
              >
                <Button type="button" variant="secondary" size="sm" disabled>
                  Configure API
                </Button>
              </VectorOption>
            </div>
            <div className="mt-6 flex items-center justify-between gap-4">
              <h3 className="text-lg font-extrabold">Model Context Protocol (MCP)</h3>
              <Button type="button" variant="secondary" size="sm" disabled>
                Advanced
              </Button>
            </div>
            <div className="mt-3 grid gap-3 rounded-md border bg-white p-4 md:grid-cols-[1fr_auto] md:items-center">
              <div className="flex items-center gap-4">
                <Shield className="h-6 w-6 text-muted-foreground" />
                <div>
                  <p className="font-semibold">Local Filesystem Access</p>
                  <p className="text-sm text-muted-foreground">
                    Status: Permitted for ~/Research/*
                  </p>
                </div>
              </div>
              <Button type="button" variant="secondary" disabled>
                Edit Rules
              </Button>
            </div>
          </SettingsSectionCard>
        </div>

        <div className="space-y-6">
          <SettingsSectionCard
            icon={<Folder className="h-6 w-6" />}
            title="Files & Management"
            actions={<ChevronUp className="h-5 w-5 text-muted-foreground" />}
          >
            <FormLabel label="Download Directory">
              <div className="grid gap-3 md:grid-cols-[1fr_auto]">
                <div className="relative">
                  <Folder className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    value={downloadDir}
                    onChange={(event) => setDownloadDir(event.target.value)}
                    className="pl-12"
                  />
                </div>
                <Button type="button" variant="secondary" disabled>
                  Change
                </Button>
              </div>
            </FormLabel>
            <div className="mt-5">
              <FormLabel label="Paper Rename Template">
                <Input
                  value={renameTemplate}
                  onChange={(event) => setRenameTemplate(event.target.value)}
                  className="font-mono"
                />
              </FormLabel>
              <p className="mt-3 text-sm text-muted-foreground">
                Preview: {previewName}.pdf
              </p>
            </div>
          </SettingsSectionCard>

          <SettingsSectionCard
            icon={<GraduationCap className="h-6 w-6" />}
            title="Academic Preferences"
            actions={<ChevronUp className="h-5 w-5 text-muted-foreground" />}
          >
            <FormLabel label="Default Citation Format">
              <Select
                value={citationFormat}
                onChange={(event) => setCitationFormat(event.target.value)}
              >
                <option>APA 7th Edition</option>
                <option>MLA</option>
                <option>Chicago</option>
                <option>IEEE</option>
                <option>Vancouver</option>
              </Select>
            </FormLabel>
            <div className="mt-6">
              <p className="mb-3 text-sm font-semibold">Export Template</p>
              <button
                type="button"
                disabled
                className="flex min-h-36 w-full flex-col items-center justify-center rounded-md border border-dashed bg-white text-center text-muted-foreground"
              >
                <Upload className="mb-3 h-8 w-8" />
                <span className="font-semibold text-foreground">Upload Custom LaTeX (.cls)</span>
                <span className="mt-2 text-sm">Currently using: Default Article</span>
              </button>
            </div>
          </SettingsSectionCard>

          <UserManagementCard
            currentUser={data.currentUser}
            users={data.users}
            userLoadError={data.userLoadError}
            onReload={onReload}
          />

          {message ? <InlineNotice tone="blue">{message}</InlineNotice> : null}
          <ActionFooter
            cancelLabel="Discard Changes"
            saveLabel="Save Settings"
            onCancel={resetSettings}
            onSave={saveSettings}
          />
        </div>
      </div>
      <div className="mt-6">
        <InlineNotice tone="amber">
          Model provider keys, vector database settings, MCP rules, file paths, and academic
          preferences are local UI drafts in this MVP. No external API verification or RAG rebuild
          is triggered from this page.
        </InlineNotice>
      </div>
    </>
  );
}

export function SettingsPageClient() {
  const [state, reload] = useSettingsData();

  return (
    <AppShell>
      <PageContainer>
        {state.status === "loading" ? (
          <LoadingSkeleton variant="cards" />
        ) : state.status === "error" ? (
          <ErrorState message={state.message} onRetry={reload} />
        ) : (
          <SettingsReady data={state.data} onReload={reload} />
        )}
      </PageContainer>
    </AppShell>
  );
}
