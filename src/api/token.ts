import type { SetAuthOpts, PersistMode, AuthListener } from "@/types";

const PERSIST_MODE: PersistMode =
  (import.meta.env.VITE_AUTH_PERSIST as PersistMode) ?? "session";

const STORAGE_KEY = "token_session_ephemeral";
let currentToken: string | null = null;

const listeners = new Set<AuthListener>();

const bc =
  typeof BroadcastChannel !== "undefined" ? new BroadcastChannel("auth") : null;

function persistWrite(token: string | null) {
  if (PERSIST_MODE === "none") return;
  try {
    const store =
      PERSIST_MODE === "session" ? window.sessionStorage : window.localStorage;
    if (token) {
      store.setItem(STORAGE_KEY, token);
    } else {
      store.removeItem(STORAGE_KEY);
    }
  } catch {}
}

function persistRead(): string | null {
  if (PERSIST_MODE === "none") return null;
  try {
    const store =
      PERSIST_MODE === "session" ? window.sessionStorage : window.localStorage;
    return store.getItem(STORAGE_KEY);
  } catch {
    return null;
  }
}

function broadcast(token: string | null) {
  try {
    bc?.postMessage({ type: "auth-change", token });
  } catch {}
}

bc?.addEventListener("message", (ev) => {
  if (!ev?.data || ev.data.type !== "auth-change") return;
  if (ev.data.token !== currentToken) {
    currentToken = ev.data.token ?? null;
    notify();
  }
});

window.addEventListener("storage", (ev) => {
  if (!ev) return;
  if (ev.key !== STORAGE_KEY) return;
  const newVal = ev.newValue ?? null;
  if (newVal !== currentToken) {
    currentToken = newVal;
    notify();
  }
});

function notify() {
  for (const fn of listeners) {
    try {
      fn(currentToken);
    } catch {}
  }
}

export function onAuthChange(fn: AuthListener) {
  listeners.add(fn);
  return () => listeners.delete(fn);
}

export function getToken(): string | null {
  return currentToken;
}

export function setAuth(token: string | null, opts: SetAuthOpts = {}) {
  currentToken = token;
  persistWrite(token);
  notify();
  if (!opts?.silent) broadcast(token);
}

export function bootAuthFromSession() {
  const bootToken = persistRead();
  if (bootToken) {
    setAuth(bootToken, { reason: "boot", silent: true });
  } else {
    setAuth(null, { reason: "boot", silent: true });
  }
}

type RefreshFn = () => Promise<string>;
let _refreshImpl: RefreshFn | null = null;

export function setRefreshImpl(fn: RefreshFn | null) {
  _refreshImpl = fn;
}

export function getRefreshImpl(): RefreshFn | null {
  return _refreshImpl;
}
