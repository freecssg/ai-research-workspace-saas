export const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ??
  "http://127.0.0.1:8000";

const ACCESS_TOKEN_KEY = "scholarflow.accessToken";
const USER_KEY = "scholarflow.user";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  role: "admin" | "member";
  is_active: boolean;
  created_at: string;
  updated_at: string;
};

export type LoginResponse = {
  access_token: string;
  token_type: string;
  user: AuthUser;
};

type LoginPayload = {
  email: string;
  password: string;
};

type ApiErrorPayload = {
  detail?: string;
};

function getStorage(persist: boolean): Storage | null {
  if (typeof window === "undefined") {
    return null;
  }

  return persist ? window.localStorage : window.sessionStorage;
}

function parseApiError(payload: unknown, fallback: string) {
  if (
    payload &&
    typeof payload === "object" &&
    "detail" in payload &&
    typeof (payload as ApiErrorPayload).detail === "string"
  ) {
    return (payload as ApiErrorPayload).detail;
  }

  return fallback;
}

export async function login(
  payload: LoginPayload,
  options: { persist?: boolean } = {},
): Promise<LoginResponse> {
  const response = await fetch(`${API_BASE_URL}/api/v1/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const responsePayload = (await response.json().catch(() => null)) as
    | LoginResponse
    | ApiErrorPayload
    | null;

  if (!response.ok) {
    throw new Error(
      parseApiError(
        responsePayload,
        "Unable to sign in. Check your email and password, then try again.",
      ),
    );
  }

  const loginResponse = responsePayload as LoginResponse;
  storeAuthSession(loginResponse, options.persist ?? true);
  return loginResponse;
}

export function storeAuthSession(auth: LoginResponse, persist: boolean) {
  const storage = getStorage(persist);
  if (!storage) {
    return;
  }

  storage.setItem(ACCESS_TOKEN_KEY, auth.access_token);
  storage.setItem(USER_KEY, JSON.stringify(auth.user));

  const fallbackStorage = persist ? window.sessionStorage : window.localStorage;
  fallbackStorage.removeItem(ACCESS_TOKEN_KEY);
  fallbackStorage.removeItem(USER_KEY);
}

export function getStoredAccessToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return (
    window.localStorage.getItem(ACCESS_TOKEN_KEY) ??
    window.sessionStorage.getItem(ACCESS_TOKEN_KEY)
  );
}

export function clearAuthSession() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(USER_KEY);
  window.sessionStorage.removeItem(ACCESS_TOKEN_KEY);
  window.sessionStorage.removeItem(USER_KEY);
}
