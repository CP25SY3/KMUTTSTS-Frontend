import { apiClient } from "@/api/shared/client";
import { LoginInput, LoginResponse, StrapiUser } from "./authTypes";
import { pathEndpoints } from "@/api/shared/endpoints";

const TOKEN = "token";
const MSAL_TOKEN = "msal_token";
const MSAL_USER = "msal_user";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN);
}
export function setToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(TOKEN, token);
}
export function clearToken() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(TOKEN);
}

// MSAL token management
export function getMsalToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(MSAL_TOKEN);
}

export function setMsalToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MSAL_TOKEN, token);
}

export function getMsalUser() {
  if (typeof window === "undefined") return null;
  const userStr = localStorage.getItem(MSAL_USER);
  return userStr ? JSON.parse(userStr) : null;
}

export function setMsalUser(user: Record<string, unknown>) {
  if (typeof window === "undefined") return;
  localStorage.setItem(MSAL_USER, JSON.stringify(user));
}

export function clearMsalAuth() {
  if (typeof window === "undefined") return;
  localStorage.removeItem(MSAL_TOKEN);
  localStorage.removeItem(MSAL_USER);
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
  clearMsalAuth();
}
