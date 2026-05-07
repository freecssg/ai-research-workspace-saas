import { apiDelete, apiGet, apiPatch, apiPost } from "@/lib/api-client";
import type { AuthUser } from "@/lib/auth-client";

export type MessageResponse = {
  detail: string;
};

export type ChangePasswordPayload = {
  current_password: string;
  new_password: string;
};

export type AdminUserCreate = {
  email: string;
  name: string;
  password: string;
  role: AuthUser["role"];
  is_active: boolean;
};

export type AdminUserUpdate = Partial<{
  email: string;
  name: string;
  password: string;
  role: AuthUser["role"];
  is_active: boolean;
}>;

export const LOCAL_LAB_DEFAULT_PASSWORD = "guelph";

export function getCurrentUser() {
  return apiGet<AuthUser>("/auth/me");
}

export function changePassword(payload: ChangePasswordPayload) {
  return apiPatch<AuthUser>("/auth/change-password", payload);
}

export function listAdminUsers() {
  return apiGet<AuthUser[]>("/admin/users?skip=0&limit=100");
}

export function createAdminUser(payload: AdminUserCreate) {
  return apiPost<AuthUser>("/admin/users", payload);
}

export function updateAdminUser(userId: string, payload: AdminUserUpdate) {
  return apiPatch<AuthUser>(`/admin/users/${userId}`, payload);
}

export function deactivateAdminUser(userId: string) {
  return apiDelete<MessageResponse>(`/admin/users/${userId}`);
}
