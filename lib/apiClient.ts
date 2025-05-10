import { getSession } from "next-auth/react";
import { toast } from "sonner"; // For displaying user-friendly error messages

// Define the shape of a generic API error response from your backend
interface ApiErrorResponse {
  timestamp?: string;
  status?: number;
  error?: string;
  message?: string; // This is often the most user-friendly part
  path?: string;
  // Add any other common error fields your backend might return
}

// 1. API Base URL - Should be configured in your .env.local or .env file
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8080"; // Default if not set

// Helper to construct full API URLs
const getApiUrl = (path: string) => `${API_BASE_URL}${path}`;

// 2. Function to get authentication token
async function getAuthToken(): Promise<string | null> {
  const session = await getSession();
  // Assuming your JWT is stored in session.accessToken or similar
  // Adjust this based on how your NextAuth session is structured
  if (session && (session as any).accessToken) {
    return (session as any).accessToken;
  }
  if (session && (session as any).jwt) { // Common alternative
    return (session as any).jwt;
  }
  // If using a different token structure in your session, adapt here
  // console.warn("No access token found in session for API client.");
  return null;
}

// 3. Generic API request function
interface RequestOptions extends RequestInit {
  // Add any custom options you might need
  isFormData?: boolean; // To handle FormData requests differently
};

async function apiRequest<T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<T> {
  const token = await getAuthToken();
  const headers: HeadersInit = {
    ...(options.isFormData ? {} : { "Content-Type": "application/json" }), // Don't set Content-Type for FormData
    ...options.headers,
    "Authorization": token ? `Bearer ${token}` : '', // Set Authorization header if token exists
  };
  // headers.

  // if (token) {
  //   headers = {
  //     ...headers,
  //     "Authorization": `Bearer ${token}`,
  //     // If you need to set the token in a different way, adjust here
  //   }
  //   // headers as  ["Authorization"] = `Bearer ${token}`;
  // }

  const config: RequestInit = {
    ...options,
    headers,
  };

  try {
    const response = await fetch(getApiUrl(endpoint), config);

    if (!response.ok) {
      let errorData: ApiErrorResponse | null = null;
      try {
        // Try to parse the error response from the backend
        errorData = await response.json();
      } catch (e) {
        // If parsing fails, use the status text
        console.error("Failed to parse error JSON:", e);
      }

      // Construct a user-friendly error message
      const errorMessage =
        errorData?.message ||
        response.statusText ||
        `Request failed with status ${response.status}`;

      console.error(
        `API Error: ${response.status} ${errorMessage}`,
        errorData
      );
      toast.error(errorMessage); // Display user-friendly error

      // Throw an error that can be caught by the calling function for specific handling
      const error = new Error(errorMessage) as any;
      error.status = response.status;
      error.data = errorData;
      throw error;
    }

    // If response is OK but has no content (e.g., 204 No Content for DELETE)
    if (response.status === 204) {
      return null as T; // Or an appropriate representation for no content
    }

    // For other successful responses, parse JSON
    return (await response.json()) as T;
  } catch (error: any) {
    // Handle network errors or errors thrown from the !response.ok block
    if (!error.status) { // Likely a network error if status isn't set
      console.error("Network or unhandled API error:", error);
      toast.error("A network error occurred, or the server is unreachable.");
    }
    throw error; // Re-throw the error so it can be handled by the caller
  }
}

// 4. Specific API functions (Examples based on your Yowyob docs)

// --- Resource Management ---
export const resourceApi = {
  create: async <T = any>(data: any): Promise<T> =>
    apiRequest<T>("/api/resource", { method: "POST", body: JSON.stringify(data) }),
  getById: async <T = any>(id: string): Promise<T> =>
    apiRequest<T>(`/api/resource/${id}`, { method: "GET" }),
  update: async <T = any>(id: string, data: any): Promise<T> =>
    apiRequest<T>(`/api/resource/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: async (id: string): Promise<void> => // DELETE often returns 204 No Content
    apiRequest<void>(`/api/resource/${id}`, { method: "DELETE" }),
  scheduleCreate: async <T = any>(data: any): Promise<T> =>
    apiRequest<T>("/api/resource/schedule/create", { method: "POST", body: JSON.stringify(data) }),
  scheduleUpdate: async <T = any>(data: any): Promise<T> => // Assuming ID is in the data or path needs adjustment
    apiRequest<T>("/api/resource/schedule/update", { method: "PUT", body: JSON.stringify(data) }),
  scheduleDelete: async (id: string): Promise<void> =>
    apiRequest<void>(`/api/resource/schedule/delete/${id}`, { method: "DELETE" }),
};

// --- Service Management ---
export const serviceApi = {
  create: async <T = any>(data: any): Promise<T> =>
    apiRequest<T>("/api/service", { method: "POST", body: JSON.stringify(data) }),
  getById: async <T = any>(id: string): Promise<T> =>
    apiRequest<T>(`/api/service/${id}`, { method: "GET" }),
  update: async <T = any>(id: string, data: any): Promise<T> =>
    apiRequest<T>(`/api/service/${id}`, { method: "PUT", body: JSON.stringify(data) }),
  delete: async (id: string): Promise<void> =>
    apiRequest<void>(`/api/service/${id}`, { method: "DELETE" }),
  scheduleCreate: async <T = any>(data: any): Promise<T> =>
    apiRequest<T>("/api/service/schedule/create", { method: "POST", body: JSON.stringify(data) }),
  scheduleUpdate: async <T = any>(data: any): Promise<T> => // Assuming ID is in the data or path needs adjustment
    apiRequest<T>("/api/service/schedule/update", { method: "PUT", body: JSON.stringify(data) }),
  scheduleDelete: async (id: string): Promise<void> =>
    apiRequest<void>(`/api/service/schedule/delete/${id}`, { method: "DELETE" }),
};

// --- Additional Endpoints ---
export const additionalApi = {
  sendKafkaMessage: async <T = any>(data: any): Promise<T> =>
    apiRequest<T>("/api/kafka/send", { method: "POST", body: JSON.stringify(data) }),
  executeStrategy: async <T = any>(data: any): Promise<T> =>
    apiRequest<T>("/api/strategy/execute", { method: "POST", body: JSON.stringify(data) }),
};

// You can also export the generic function if needed for one-off calls
export { apiRequest, getApiUrl };