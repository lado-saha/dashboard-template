import { getSession } from "next-auth/react";
import { toast } from "sonner";
import {
  AuthRequest, CreateUserRequest, LoginResponse, UserDto, UserInfo,
} from "@/types/auth";

interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string;
  path?: string;
  errors?: Record<string, string>;
}

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080/auth-service";

// Read client credentials from environment variables
const AUTH_SERVICE_CLIENT_ID = process.env.NEXT_PUBLIC_AUTH_SERVICE_CLIENT_ID;
const AUTH_SERVICE_CLIENT_SECRET = process.env.NEXT_PUBLIC_AUTH_SERVICE_CLIENT_SECRET;

let CLIENT_BASIC_AUTH_TOKEN: string | null = null;
if (AUTH_SERVICE_CLIENT_ID && AUTH_SERVICE_CLIENT_SECRET) {
  // Base64 encode "username:password"
  // In Node.js environment (like Next.js server-side parts or build time):
  // CLIENT_BASIC_AUTH_TOKEN = `Basic ${Buffer.from(`${AUTH_SERVICE_CLIENT_ID}:${AUTH_SERVICE_CLIENT_SECRET}`).toString('base64')}`;
  // In browser environment (which this apiClient will run in for client-side calls):
  if (typeof window !== "undefined") { // Ensure this runs only in the browser
    CLIENT_BASIC_AUTH_TOKEN = `Basic ${btoa(`${AUTH_SERVICE_CLIENT_ID}:${AUTH_SERVICE_CLIENT_SECRET}`)}`;
  } else {
    // For server-side rendering or Node.js context if this file were ever imported there for some reason
    CLIENT_BASIC_AUTH_TOKEN = `Basic ${Buffer.from(`${AUTH_SERVICE_CLIENT_ID}:${AUTH_SERVICE_CLIENT_SECRET}`).toString('base64')}`;
  }
} else {
  console.warn("Auth Service client ID or secret not configured in environment variables. Basic Auth will not be sent for client calls.");
}


const getApiUrl = (path: string) => `${API_BASE_URL}${path}`;

async function getAuthToken(): Promise<string | null> {
  const session = await getSession();
  if (session && (session as any).accessToken) {
    return (session as any).accessToken;
  }
  return null;
}

interface RequestOptions extends RequestInit {
  isFormData?: boolean;
  useClientBasicAuth?: boolean;
}

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {},
  isUserAuthAction: boolean = false
): Promise<T> {
  let userAccessToken: string | null = null;
  if (!isUserAuthAction && !options.useClientBasicAuth) {
    userAccessToken = await getAuthToken();
  }

  const headers: HeadersInit = {
    ...(options.isFormData ? {} : { "Content-Type": "application/json" }),
    ...options.headers,
  };

  if (options.useClientBasicAuth && CLIENT_BASIC_AUTH_TOKEN) {
    (headers as Record<string, string>)["Authorization"] = CLIENT_BASIC_AUTH_TOKEN;
  } else if (userAccessToken) {
    (headers as Record<string, string>)["Authorization"] = `Bearer ${userAccessToken}`;
  } else if (options.useClientBasicAuth && !CLIENT_BASIC_AUTH_TOKEN) {
    console.error("Attempted to use client basic auth, but token is not configured.");
    // Potentially throw an error here or handle as a configuration issue
  }


  const config: RequestInit = { ...options, headers };

  try {
    const response = await fetch(getApiUrl(endpoint), config);

    if (!response.ok) {
      let errorData: ApiErrorResponse | null = null;
      let errorMessage = `Request failed with status ${response.status}`;
      try {
        errorData = await response.json();
        errorMessage = errorData?.message || response.statusText || errorMessage;
        if (errorData?.errors && typeof errorData.errors === 'object' && Object.keys(errorData.errors).length > 0) {
          const validationErrors = Object.entries(errorData.errors)
            .map(([field, message]) => `${field}: ${message}`)
            .join("; ");
          errorMessage = `${errorMessage} (${validationErrors})`;
        }
      } catch (e) { /* Ignore */ }

      console.error(`API Error: ${response.status} ${errorMessage} for endpoint: ${endpoint}`, errorData);
      // Only show toast if it's not a 401/403 from user auth action, as NextAuth might handle those redirects
      if (!(isUserAuthAction && (response.status === 401 || response.status === 403))) {
        toast.error(errorMessage);
      }


      const error = new Error(errorMessage) as any;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    if (response.status === 204 || response.headers.get("content-length") === "0") {
      return null as T;
    }
    return (await response.json()) as T;
  } catch (error: any) {
    if (!error.status && !(error instanceof SyntaxError)) {
      console.error("Network or unhandled API error:", error);
      if (!(isUserAuthAction)) { // Avoid double toasting if NextAuth handles it
        toast.error("A network error occurred, or the server is unreachable.");
      }
    }
    throw error;
  }
}

// Auth Service API functions
export const authApi = {
  register: async (data: CreateUserRequest): Promise<UserDto> =>
    apiRequest<UserDto>(
      "/api/register",
      { method: "POST", body: JSON.stringify(data), useClientBasicAuth: true },
      true
    ),
  login: async (data: AuthRequest): Promise<LoginResponse> =>
    apiRequest<LoginResponse>(
      "/api/login",
      { method: "POST", body: JSON.stringify(data), useClientBasicAuth: true },
      true
    ),
  getCurrentUser: async (): Promise<UserInfo> =>
    apiRequest<UserInfo>("/api/user", { method: "GET" }),
};

// Resource Management (from previous step, ensure it uses the updated apiRequest)
export const resourceApi = {
  create: async <T = any>(data: any): Promise<T> => apiRequest<T>("/api/resource", { method: "POST", body: JSON.stringify(data) }),
  getById: async <T = any>(id: string): Promise<T> => apiRequest<T>(`/api/resource/${id}`),
  update: async <T = any>(id: string, data: any): Promise<T> => apiRequest<T>(`/api/resource/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: async (id: string): Promise<void> => apiRequest<void>(`/api/resource/${id}`, { method: "DELETE" }),
  scheduleCreate: async <T = any>(data: any): Promise<T> => apiRequest<T>("/api/resource/schedule/create", { method: "POST", body: JSON.stringify(data) }),
  scheduleUpdate: async <T = any>(data: any): Promise<T> => apiRequest<T>("/api/resource/schedule/update", { method: "PUT", body: JSON.stringify(data) }),
  scheduleDelete: async (id: string): Promise<void> => apiRequest<void>(`/api/resource/schedule/delete/${id}`, { method: "DELETE" }),
};

// Service Management (from previous step, ensure it uses the updated apiRequest)
export const serviceApi = {
  create: async <T = any>(data: any): Promise<T> => apiRequest<T>("/api/service", { method: "POST", body: JSON.stringify(data) }),
  getById: async <T = any>(id: string): Promise<T> => apiRequest<T>(`/api/service/${id}`),
  update: async <T = any>(id: string, data: any): Promise<T> => apiRequest<T>(`/api/service/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: async (id: string): Promise<void> => apiRequest<void>(`/api/service/${id}`, { method: "DELETE" }),
  scheduleCreate: async <T = any>(data: any): Promise<T> => apiRequest<T>("/api/service/schedule/create", { method: "POST", body: JSON.stringify(data) }),
  scheduleUpdate: async <T = any>(data: any): Promise<T> => apiRequest<T>("/api/service/schedule/update", { method: "PUT", body: JSON.stringify(data) }),
  scheduleDelete: async (id: string): Promise<void> => apiRequest<void>(`/api/service/schedule/delete/${id}`, { method: "DELETE" }),
};

export { apiRequest, getApiUrl };