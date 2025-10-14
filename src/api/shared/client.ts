const BASE = process.env.NEXT_PUBLIC_API_BASE_URL!;
const DEFAULT_TIMEOUT = 10_000;

type Method = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";
type Opts = {
  method?: Method;
  body?: unknown;
  auth?: boolean;
  headers?: Record<string, string>;
  timeoutMs?: number;
  retry?: number;
};

export type AppError = { status: number; message: string; detail?: unknown };

function toHeader(options?: Opts) {
  const header: Record<string, string> = { ...(options?.headers ?? {}) };
  if (options?.body && !(options?.body instanceof FormData))
    header["content-type"] = "application/json";
  if (options?.auth && typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) header["authorization"] = `Bearer ${token}`;
  }
  return header;
}

// Simple backoff: 200ms, 400ms, 800ms...
const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

async function doFetch(
  path: string,
  options: Opts = {},
  attempt: number = 0
): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(
    () => controller.abort(),
    options.timeoutMs ?? DEFAULT_TIMEOUT
  );

  try {
    const response = await fetch(`${BASE}${path}`, {
      method: options.method ?? "GET",
      headers: toHeader(options),
      body: options.body
        ? options.body instanceof FormData
          ? options.body
          : JSON.stringify(options.body)
        : undefined,
      // credentials: 'include', // for cookies if needed
      signal: controller.signal,
    });

    // Retry on 502, 503, 504
    if (
      [502, 503, 504].includes(response.status) &&
      attempt < (options.retry ?? 0)
    ) {
      await sleep(200 * 2 ** attempt);
      return doFetch(path, options, attempt + 1);
    }
    return response;
  } finally {
    clearTimeout(timeout);
  }
}

function safeJson(s: string) {
  try {
    return JSON.parse(s);
  } catch {
    return s;
  }
}

async function handle<T>(response: Response): Promise<T> {
  const ct = response.headers.get("content-type") || "";
  const isJson = ct.includes("application/json");
  const text = await response.text();
  const data = isJson && text ? safeJson(text) : text || null;

  if (!response.ok) {
    const message =
      data?.error?.message ||
      data?.message ||
      response.statusText ||
      "request failed";

    throw {
      status: response.status,
      message: message,
      detail: data,
    } as AppError;
  }
  return data as T;
}
export const apiClient = {
  get: <T>(pathEndpoint: string, o: Omit<Opts, "method" | "body"> = {}) =>
    doFetch(pathEndpoint, { ...o, method: "GET" }).then((r) => handle<T>(r)),
  post: <T>(pathEndpoint: string, body?: unknown, o: Omit<Opts, "method"> = {}) =>
    doFetch(pathEndpoint, { ...o, method: "POST", body }).then((r) => handle<T>(r)),
  put: <T>(pathEndpoint: string, body?: unknown, o: Omit<Opts, "method"> = {}) =>
    doFetch(pathEndpoint, { ...o, method: "PUT", body }).then((r) => handle<T>(r)),
  patch: <T>(pathEndpoint: string, body?: unknown, o: Omit<Opts, "method"> = {}) =>
    doFetch(pathEndpoint, { ...o, method: "PATCH", body }).then((r) => handle<T>(r)),
  delete: <T>(pathEndpoint: string, o: Omit<Opts, "method" | "body"> = {}) =>
    doFetch(pathEndpoint, { ...o, method: "DELETE" }).then((r) => handle<T>(r)),
};
