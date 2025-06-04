import apiClient from "./apiClient";
import { AUTH_ENDPOINTS, USER_ENDPOINTS } from "./endpoints";
import { setItem, removeItem, getItem } from "@/utils/asyncStorage";
import {
  AUTH_KEY,
  USER,
  type AuthCredentials,
  type TokenResponse,
  type LoginData,
  type User,
  ApiResponse,
} from "@/types";

/**
 * Authentication Service
 *
 * Handles all authentication-related API calls
 */

class AuthService {
  /**
   * Login user
   * @param email User username
   * @param password User password
   * @returns Login response data
   */
  async login(email: string, password: string): Promise<void> {
    try {
      const credentials: AuthCredentials = { email, password };
      const response = await apiClient.post<TokenResponse>(
        AUTH_ENDPOINTS.LOGIN,
        credentials
      );
      const loginData: LoginData = response.data.data;
      // Get user info
      let userData: User | undefined;
      try {
        const userResponse = await apiClient.get<ApiResponse<User>>(
          USER_ENDPOINTS.ME,
          {
            headers: {
              Authorization: `Bearer ${loginData.accessToken}`,
            },
          }
        );
        userData = userResponse.data.data;
      } catch (error) {
        console.error("Failed to get user data after login:", error);
      }
      // Save auth data to local storage
      await setItem(AUTH_KEY, loginData);
      // Save user data to local storage
      await setItem(USER, userData);
    } catch (error) {
      throw error;
    }
  }
  /**
   * Register new user
   * @param userData User registration data
   * @returns Registration response
   */
  async register(userData: any) {
    const response = await apiClient.post(AUTH_ENDPOINTS.REGISTER, userData);
    return response.data;
  }
  /**
   * Logout user
   * Calls logout endpoint and clears local storage
   */
  async logout() {
    await removeItem(AUTH_KEY);
    await removeItem(USER);
  }
  /**
   * Get current user info
   * @returns User data
   */
  async getCurrentUser(): Promise<User | null> {
    try {
      const response = await apiClient.get(USER_ENDPOINTS.ME);
      return response.data.data;
    } catch (error) {
      return null;
    }
  }
  /**
   * Check if user is authenticated
   * @returns Boolean indicating authentication status
   */
  async isAuthenticated(): Promise<boolean> {
    try {
      const authData = await this.getAuthData();
      if (!authData?.accessToken) return false;
      // Verify token by making a request to get user info
      const user = await this.getCurrentUser();
      return !!user;
    } catch (error) {
      return false;
    }
  }
  /**
   * Get current authentication data from storage
   * @returns Authentication data
   */
  async getAuthData(): Promise<LoginData | null> {
    try {
      return await getItem<LoginData>(AUTH_KEY);
    } catch (error) {
      return null;
    }
  }
}

export default new AuthService();
