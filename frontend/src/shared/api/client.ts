const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

function getToken(): string | null {
  return localStorage.getItem("token");
}

export function setToken(token: string) {
  localStorage.setItem("token", token);
}

export function clearToken() {
  localStorage.removeItem("token");
}

interface RequestOptions {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  auth?: boolean; // defaults to true
}

export async function apiClient<T>(
  path: string,
  options: RequestOptions = {}
): Promise<T> {
  const { method = "GET", body, auth = true } = options;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (auth) {
    const token = getToken();
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

 if (!response.ok) {
    let detail = "Something went wrong";
    try {
      const errorData = await response.json();
      if (Array.isArray(errorData.detail)) {
        // FastAPI validation errors: array of {loc, msg, type}
        detail = errorData.detail
          .map((e: { loc: string[]; msg: string }) => `${e.loc[e.loc.length - 1]}: ${e.msg}`)
          .join(", ");
      } else if (typeof errorData.detail === "string") {
        detail = errorData.detail;
      }
    } catch {
      // response wasn't JSON, keep default message
    }
    throw new ApiError(response.status, detail);
  }

  // Some endpoints might return no content
  const text = await response.text();
  return text ? JSON.parse(text) : (undefined as T);
}