/**
 * Robust FastApi client utility for Next.js route handlers.
 * Automatically checks candidate backend addresses (port 8000, 8765, PROOFSTACK_API_URL)
 * with timeouts and automatic fallback.
 */

const CANDIDATE_URLS = [
  process.env.PROOFSTACK_API_URL,
  "http://127.0.0.1:8000",
  "http://127.0.0.1:8765",
  "http://localhost:8000",
  "http://localhost:8765",
].filter(Boolean) as string[];

const DEFAULT_API_KEY = process.env.PROOFSTACK_API_KEY || "change-me-in-production";

export async function forwardToFastApi(
  path: string,
  options: {
    method?: string;
    body?: any;
    timeoutMs?: number;
  } = {}
): Promise<any | null> {
  const method = options.method || "GET";
  const timeoutMs = options.timeoutMs || 1500;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    "X-API-Key": DEFAULT_API_KEY,
  };

  const body = options.body ? JSON.stringify(options.body) : undefined;

  for (const baseUrl of CANDIDATE_URLS) {
    try {
      const cleanBase = baseUrl.replace(/\/$/, "");
      const cleanPath = path.replace(/^\//, "");
      const targetUrl = `${cleanBase}/${cleanPath}`;

      const res = await fetch(targetUrl, {
        method,
        headers,
        body,
        signal: AbortSignal.timeout(timeoutMs),
      });

      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Continue to next candidate backend URL
    }
  }

  return null;
}
