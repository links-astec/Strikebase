import type {
  OpportunitiesResponse, AnalysisResponse,
  ScanRequest, UserProfile, Suggestion,
} from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("sb_token");
}

async function apiFetch<T>(path: string, opts: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(opts.headers as Record<string, string> | undefined),
  };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const r = await fetch(`${BASE}${path}`, { ...opts, headers });
  if (!r.ok) {
    const err = await r.json().catch(() => ({ detail: r.statusText }));
    throw new Error((err as { detail?: string }).detail || "Request failed");
  }
  return r.json() as Promise<T>;
}

export async function register(email: string, password: string, display_name?: string) {
  return apiFetch<{ access_token: string; user: { id: string; email: string } }>(
    "/auth/register", { method: "POST", body: JSON.stringify({ email, password, display_name }) }
  );
}

export async function login(email: string, password: string) {
  return apiFetch<{ access_token: string; refresh_token: string; user: { id: string; email: string } }>(
    "/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }
  );
}

export async function getProfile(): Promise<UserProfile> {
  return apiFetch("/users/me");
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  return apiFetch("/users/me", { method: "PUT", body: JSON.stringify(data) });
}

export async function startScan(r: ScanRequest) {
  return apiFetch<{ scan_id: string; status: string }>("/scan", { method: "POST", body: JSON.stringify(r) });
}

export async function getOpportunities(scan_id: string): Promise<OpportunitiesResponse> {
  return apiFetch(`/opportunities/${scan_id}`);
}

export async function getDemoOpportunities(): Promise<OpportunitiesResponse> {
  return apiFetch("/opportunities/demo");
}

export async function analyzeOpportunity(id: string): Promise<AnalysisResponse> {
  return apiFetch(`/analyze/${id}`, { method: "POST" });
}

export async function analyzeJob(body: {
  url?: string; description?: string; title?: string;
  skills: string[]; hourly_rate: number; experience: string;
}): Promise<AnalysisResponse> {
  return apiFetch("/jobs/analyze", { method: "POST", body: JSON.stringify(body) });
}

export async function getSuggestions(body: {
  skills: string[]; experience: string; hourly_rate: number;
  current_score?: number; target_score?: number; github_url?: string;
}): Promise<{ suggestions: Suggestion[] }> {
  return apiFetch("/suggestions", { method: "POST", body: JSON.stringify(body) });
}

export async function forgotPassword(email: string): Promise<{ message: string }> {
  return apiFetch("/auth/forgot-password", { method: "POST", body: JSON.stringify({ email }) });
}

export async function resetPassword(access_token: string, new_password: string): Promise<{ message: string }> {
  return apiFetch("/auth/reset-password", { method: "POST", body: JSON.stringify({ access_token, new_password }) });
}

export async function getUserScans(): Promise<{ scans: import("./types").Scan[] }> {
  return apiFetch("/scans/history");
}

export async function testSerp(q: string) {
  return apiFetch<{ count: number; results: unknown[] }>(`/test/serp?q=${encodeURIComponent(q)}`);
}
