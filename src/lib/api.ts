// Tiny client-side fetch helper that throws on non-2xx with the server message.
export async function api<T = unknown>(
  url: string,
  options?: RequestInit & { json?: unknown },
): Promise<T> {
  const { json, ...rest } = options ?? {};
  const res = await fetch(url, {
    ...rest,
    headers: {
      ...(json !== undefined ? { "Content-Type": "application/json" } : {}),
      ...(rest.headers ?? {}),
    },
    body: json !== undefined ? JSON.stringify(json) : rest.body,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error((data as { error?: string }).error ?? `Request failed (${res.status})`);
  return data as T;
}
