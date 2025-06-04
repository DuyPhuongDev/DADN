import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  AxiosError,
} from "axios";
import { getItem, removeItem, setItem } from "@/utils/asyncStorage";
import { AUTH_KEY, USER, type LoginData } from "@/types";
import { AUTH_ENDPOINTS } from "./endpoints";
import env from "@/config/environment";
import { Alert } from "react-native";

// Interface cho originalRequest để đảm bảo type safety
interface CustomAxiosRequestConfig extends AxiosRequestConfig {
  _retry?: boolean;
}

/**
 * API Client Configuration
 *
 * Configured Axios instance with:
 * - Base URL from .env using react-native-dotenv
 * - Authentication token handling with auto refresh
 * - Network and error handling with automatic logout
 * - Request/response debugging
 * - Integration with AsyncStorage error handling
 */
console.log("API URL:", env.apiUrl);
console.log("API Version:", env.apiVersion);
const API_URL =
  `${env.apiUrl}/${env.apiVersion}` || "http://localhost:9999/api/v1";
// Create API request configuration
const apiConfig: AxiosRequestConfig = {
  baseURL: API_URL,
  timeout: env.apiTimeout,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
  withCredentials: true, // Enable cookies for refresh token
};

// Create API instance
const apiClient: AxiosInstance = axios.create(apiConfig);

// Flag to prevent multiple refresh requests
let isRefreshing = false;
// Queue of requests to retry after token refresh
let refreshSubscribers: Array<(token: string) => void> = [];

// Function to add request to retry queue
const subscribeTokenRefresh = (callback: (token: string) => void) => {
  refreshSubscribers.push(callback);
};

// Function to retry requests with new token
const onTokenRefreshed = (token: string) => {
  refreshSubscribers.forEach((callback) => callback(token));
  refreshSubscribers = [];
};

// Function to refresh token
const refreshToken = async (refreshToken: string): Promise<string | null> => {
  try {
    // Refresh token is handled by httpOnly cookie
    const response = await axios.post(
      API_URL,
      { refreshToken },
      { withCredentials: true }
    );

    // Get the new token
    const token = response.data.data;

    // Update stored token
    try {
      const authData = await getItem<LoginData>(AUTH_KEY);
      if (authData) {
        await setItem(AUTH_KEY, token);
      }
      return token.accessToken;
    } catch (storageError) {
      console.error(
        "Failed to update auth data in AsyncStorage:",
        storageError
      );
      return null;
    }
  } catch (error) {
    // Failed to refresh token, logout user
    try {
      await removeItem(AUTH_KEY);
      await removeItem(USER);
    } catch (storageError) {
      console.error(
        "Failed to remove auth data from AsyncStorage:",
        storageError
      );
    }
    return null;
  }
};

// Request interceptor - adds auth token to requests
apiClient.interceptors.request.use(async (config) => {
  // Add logging in debug mode
  if (env.apiDebug) {
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.data || {}
    );
  }

  // Add authentication token if available
  try {
    const data = await getItem<LoginData>(AUTH_KEY);
    if (data?.accessToken) {
      config.headers.Authorization = `Bearer ${data.accessToken}`;
    }
  } catch (error) {
    console.error("Failed to read auth data from AsyncStorage:", error);
  }
  return config;
});

// Response interceptor - handles errors and token refresh
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    // Log response in debug mode
    if (env.apiDebug) {
      console.log(`API Response: ${response.status}`, response.data);
    }
    return response;
  },
  async (error: AxiosError) => {
    const originalRequest: CustomAxiosRequestConfig =
      error.config as CustomAxiosRequestConfig;
    const status = error.response?.status;

    // Check for network error
    if (!error.response && error.message.includes("Network Error")) {
      return Promise.reject(
        "Không có kết nối mạng. Vui lòng kiểm tra kết nối của bạn."
      );
    }

    // Token expired, try to refresh if not already refreshing
    if (status === 401 && !originalRequest._retry && !isRefreshing) {
      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Attempt to refresh token
        const authData = await getItem<LoginData>(AUTH_KEY);
        const newToken = await refreshToken(authData?.refreshToken || "");

        if (newToken) {
          // Update Authorization header with new token
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${newToken}`;
          // Notify subscribers that token has been refreshed
          onTokenRefreshed(newToken);
          isRefreshing = false;
          // Retry original request
          return apiClient(originalRequest);
        } else {
          // Token refresh failed, notify UI
          isRefreshing = false;
          Alert.alert(
            "Lỗi",
            "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
          );
          return Promise.reject("Phiên đăng nhập hết hạn");
        }
      } catch (refreshError) {
        isRefreshing = false;
        Alert.alert("Lỗi", "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại.");
        return Promise.reject("Phiên đăng nhập hết hạn");
      }
    }

    // Handle case where a request failed during token refresh
    else if (status === 401 && isRefreshing) {
      // Queue request to be retried later
      return new Promise((resolve) => {
        subscribeTokenRefresh((token: string) => {
          originalRequest.headers = originalRequest.headers || {};
          originalRequest.headers.Authorization = `Bearer ${token}`;
          resolve(apiClient(originalRequest));
        });
      });
    }

    // Handle other auth errors
    else if (status === 401 || status === 403) {
      // Remove token and notify UI
      try {
        await removeItem(AUTH_KEY);
      } catch (storageError) {
        console.error(
          "Failed to remove auth data from AsyncStorage:",
          storageError
        );
      }
      const errorMessage =
        status === 401
          ? "Phiên đăng nhập hết hạn. Vui lòng đăng nhập lại."
          : "Bạn không có quyền truy cập.";
      Alert.alert("Lỗi", errorMessage);
      return Promise.reject(errorMessage);
    }

    // Log errors in debug mode
    if (env.apiDebug) {
      console.error("API Error:", error.response?.data || error.message);
    }

    return Promise.reject(
      (error.response?.data as { message?: string })?.message ||
        "Đã xảy ra lỗi. Vui lòng thử lại."
    );
  }
);

export default apiClient;
