export type RetryMark = { _retry?: boolean };
export type AuthReason =
  | "login"
  | "logout"
  | "refresh"
  | "expired"
  | "boot"
  | "force-logout";
export type SetAuthOpts = { reason?: AuthReason; silent?: boolean };
export type PersistMode = "none" | "session" | "local";
export type AuthListener = (token: string | null) => void;
