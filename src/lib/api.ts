import { authClient } from "@/lib/auth-client";

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000";

type ApiOptions = Omit<RequestInit, "headers"> & {
  headers?: HeadersInit;
  authenticated?: boolean;
};

export async function apiRequest<T>(path: string, options: ApiOptions = {}): Promise<T> {
  const { authenticated = false, headers: inputHeaders, ...init } = options;
  const headers = new Headers(inputHeaders);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (authenticated) {
    const { data, error } = await authClient.token();
    if (error || !data?.token) {
      throw new Error("Your session has expired. Please sign in again.");
    }
    headers.set("Authorization", `Bearer ${data.token}`);
  }

  let response: Response;
  try {
    response = await fetch(`${API_URL}${path}`, {
      ...init,
      headers,
      cache: "no-store",
    });
  } catch {
    throw new Error("Could not reach the BookNook service. Please try again shortly.");
  }

  const payload = (await response.json().catch(() => null)) as
    | (T & { message?: string })
    | null;
  if (!response.ok) {
    throw new Error(payload?.message || `Request failed (${response.status}).`);
  }
  if (payload === null) {
    throw new Error("The BookNook service returned an empty response.");
  }
  return payload as T;
}
