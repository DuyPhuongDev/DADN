// Key dùng để lưu trữ dữ liệu xác thực trong AsyncStorage
import { ApiResponse } from "@/types/api";

export const AUTH_KEY = "@auth";
export const USER = "@user";
// Type cho dữ liệu xác thực
export type LoginData = {
  accessToken: string;
  refreshToken?: string;
};

export type AuthCredentials = {
  email: string;
  password: string;
};

export type TokenResponse = ApiResponse<LoginData>;
