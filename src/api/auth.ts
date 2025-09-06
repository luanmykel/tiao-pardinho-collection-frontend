import type { AxiosRequestConfig } from "axios";
import { api } from "./api";
import {
  setAuth,
  getToken,
  setRefreshImpl,
  bootAuthFromSession,
} from "./token";
import { API_ROUTES } from "./routes";

let refreshInFlight: Promise<string> | null = null;

async function doRefresh(): Promise<string> {
  const current = getToken();
  if (!current) return Promise.reject(new Error("No token to refresh"));
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    try {
      const { data } = await api.post(API_ROUTES.auth.refresh, {}, {
        headers: { Authorization: `Bearer ${current}` },
        skipProgress: true,
        meta: { silent: true },
      } as AxiosRequestConfig & { skipProgress?: boolean; meta?: any });

      const newToken = data?.token ?? data?.access_token ?? null;
      if (!newToken) throw new Error("Refresh didn't return a token");

      setAuth(newToken, { reason: "refresh" });
      return newToken;
    } catch (err) {
      setAuth(null, { reason: "expired" });
      throw err;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

export async function doLogin(email: string, password: string) {
  const { data } = await api.post(API_ROUTES.auth.login, { email, password });
  const token = data?.token ?? data?.access_token ?? null;
  if (!token) throw new Error("Login didn't return a token");
  setAuth(token, { reason: "login" });
  return token;
}

export async function doLogout() {
  try {
    await api.post(API_ROUTES.auth.logout, {}, {
      meta: { silent: true },
      skipProgress: true,
    } as any);
  } catch {}
  setAuth(null, { reason: "logout" });
}

export async function me() {
  const { data } = await api.get(API_ROUTES.auth.me);
  return data as {
    id: number;
    name: string;
    email: string;
    is_admin: boolean;
    is_active: boolean;
    avatar_url: string | null;
  };
}

export async function uploadAvatar(file: File) {
  const fd = new FormData();
  fd.append("avatar", file);
  const { data } = await api.post(API_ROUTES.auth.avatar, fd, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data as { message: string; avatar_url: string };
}

export async function clearAvatar() {
  return api.delete(API_ROUTES.auth.avatar);
}

setRefreshImpl(doRefresh);
bootAuthFromSession();
