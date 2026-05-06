import {
  API_BASE_URL,
  clearAuthSession,
  getStoredAccessToken,
} from "@/lib/auth-client";

type ApiErrorPayload = {
  detail?: unknown;
};

export class ApiClientError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
  }
}

function formatApiDetail(detail: unknown) {
  if (typeof detail === "string") {
    return detail;
  }

  if (Array.isArray(detail)) {
    return detail
      .map((item) =>
        typeof item === "object" && item !== null && "msg" in item
          ? String(item.msg)
          : String(item),
      )
      .join(", ");
  }

  return null;
}

type ApiBody = Record<string, unknown> | FormData | undefined;

async function apiRequest<T>(
  path: string,
  options: {
    method?: "GET" | "POST" | "PATCH" | "DELETE";
    body?: ApiBody;
  } = {},
): Promise<T> {
  const token = getStoredAccessToken();

  if (!token) {
    throw new ApiClientError("Authentication is required.", 401);
  }

  const isFormData = options.body instanceof FormData;
  const requestBody: BodyInit | undefined =
    options.body === undefined
      ? undefined
      : isFormData
        ? options.body
        : JSON.stringify(options.body);

  const response = await fetch(`${API_BASE_URL}/api/v1${path}`, {
    method: options.method ?? "GET",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
      ...(options.body && !isFormData ? { "Content-Type": "application/json" } : {}),
    },
    body: requestBody,
  });

  const payload = (await response.json().catch(() => null)) as
    | ApiErrorPayload
    | T
    | null;

  if (!response.ok) {
    if (response.status === 401) {
      clearAuthSession();
    }

    const detail =
      payload && typeof payload === "object" && "detail" in payload
        ? formatApiDetail((payload as ApiErrorPayload).detail)
        : null;

    throw new ApiClientError(
      detail ?? "Unable to load data from the ScholarFlow API.",
      response.status,
    );
  }

  return payload as T;
}

export async function apiGet<T>(path: string): Promise<T> {
  return apiRequest<T>(path);
}

export async function apiPost<T>(path: string, body?: ApiBody): Promise<T> {
  return apiRequest<T>(path, { method: "POST", body });
}

export async function apiPatch<T>(path: string, body?: ApiBody): Promise<T> {
  return apiRequest<T>(path, { method: "PATCH", body });
}

export async function apiDelete<T>(path: string): Promise<T> {
  return apiRequest<T>(path, { method: "DELETE" });
}
