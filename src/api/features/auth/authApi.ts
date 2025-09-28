import { apiClient } from "@/api/shared/client";
import { LoginInput, LoginResponse, StrapiUser } from "./authTypes";
import { pathEndpoints } from "@/api/shared/endpoints";

const TOKEN_KEY = "auth_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}
export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN_KEY, token);
}
export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN_KEY);
}

export async function login(input: LoginInput) {
  const response = await apiClient.post<LoginResponse>(
    pathEndpoints.auth.login,
    input,
    { auth: false }
  );
  setToken(response.jwt);
  return response.user;
}

export async function me() {
  // Strapi: GET /api/users/me with Bearer token
  return apiClient.get<StrapiUser>(pathEndpoints.users.me, { auth: true });
}

export function logout() {
  clearToken();
}
