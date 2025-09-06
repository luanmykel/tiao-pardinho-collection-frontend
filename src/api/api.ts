import axios, {
  AxiosError,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";
import NProgress from "nprogress";
import { getToken, setAuth, getRefreshImpl } from "./token";
import { API_ROUTES } from "./routes";
import type { HealthResponse, AuthReason, RetryMark } from "@/types";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL,
  headers: { Accept: "application/json" },
});

NProgress.configure({ showSpinner: false });

let inflight = 0;
let startTimer: number | null = null;
const START_DELAY = 250;
let progressSuspended = false;

export function setProgressSuspended(v: boolean) {
  progressSuspended = v;
}

function isHealthUrl(url: string | undefined | null) {
  const u = (url || "").toString();
  if (!u) return false;

  const toPath = (raw: string) => {
    try {
      const base = api.defaults.baseURL || window.location.origin;
      const parsed = new URL(raw, base);
      return (parsed.pathname || "").replace(/\/+$/g, "");
    } catch {
      return raw.replace(/[?#].*$/g, "").replace(/\/+$/g, "");
    }
  };

  const path = toPath(u);
  const healthPath = toPath(API_ROUTES.health);
  return path === healthPath || path.endsWith(healthPath);
}

function isSilent(cfg: any) {
  return Boolean(
    progressSuspended ||
      cfg?.meta?.silent ||
      cfg?.headers?.["X-Background"] ||
      cfg?.skipProgress === true,
  );
}

function isUserAction(cfg: any) {
  const m = (cfg?.method || "get").toLowerCase();
  return ["post", "put", "patch", "delete"].includes(m);
}

function shouldProgress(cfg: any) {
  const url = (cfg?.url || "").toString();
  return isUserAction(cfg) && !isHealthUrl(url) && !isSilent(cfg);
}

function stopProgressIfIdle(cfg: any) {
  if (shouldProgress(cfg)) {
    inflight = Math.max(0, inflight - 1);
    if (inflight === 0) {
      if (startTimer) {
        clearTimeout(startTimer);
        startTimer = null;
      } else {
        NProgress.done(true);
      }
    }
  }
}

api.interceptors.request.use((cfg: InternalAxiosRequestConfig & RetryMark) => {
  const t = getToken?.();
  if (t) {
    (cfg.headers as any).Authorization =
      (cfg.headers as any).Authorization ?? `Bearer ${t}`;
  } else {
    if ((cfg.headers as any)?.Authorization) {
      delete (cfg.headers as any).Authorization;
    }
  }

  if (shouldProgress(cfg)) {
    inflight += 1;
    if (inflight === 1) {
      startTimer = window.setTimeout(() => {
        startTimer = null;
        NProgress.start();
      }, START_DELAY);
    }
  }

  return cfg;
});

api.interceptors.response.use(
  (response) => {
    stopProgressIfIdle(response.config);
    return response;
  },
  async (
    error: AxiosError & {
      config?: InternalAxiosRequestConfig &
        RetryMark &
        AxiosRequestConfig & { meta?: any; skipProgress?: boolean };
    },
  ) => {
    const cfg = (error.config ?? {}) as InternalAxiosRequestConfig &
      RetryMark & {
        meta?: any;
        skipProgress?: boolean;
      };
    stopProgressIfIdle(cfg as any);

    const status = error?.response?.status ?? 0;
    if (status === 401) {
      const url = (cfg as any)?.url as string | undefined;
      const isRefreshCall =
        typeof url === "string" &&
        (url === API_ROUTES.auth.refresh || url?.includes("/refresh"));

      const hasToken = !!getToken?.();
      const refresh = getRefreshImpl?.();

      if (!isRefreshCall && hasToken && refresh && !cfg._retry) {
        cfg._retry = true;
        try {
          const newTok = await refresh();
          (cfg.headers as any) = cfg.headers ?? {};
          (cfg.headers as any).Authorization = `Bearer ${newTok}`;

          return api(cfg as any);
        } catch {
          setAuth(null, { reason: "expired" as AuthReason });
          return Promise.reject(error);
        }
      }

      setAuth(null, { reason: "expired" as AuthReason });
    }

    return Promise.reject(error);
  },
);

export async function fetchBackendHealth(): Promise<HealthResponse> {
  const { data } = await api.get(API_ROUTES.health, {
    skipProgress: true,
    meta: { silent: true },
  } as any);
  return data;
}
