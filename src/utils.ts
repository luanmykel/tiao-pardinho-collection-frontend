import { notifications } from "@mantine/notifications";

export function formatViews(v?: number) {
  if (typeof v !== "number") return "-";
  const abs = Math.abs(v);
  const fmt = (n: number) =>
    new Intl.NumberFormat("pt-BR", {
      minimumFractionDigits: 0,
      maximumFractionDigits: 1,
    }).format(n);

  if (abs >= 1_000_000_000) return `${fmt(v / 1_000_000_000)} bi`;
  if (abs >= 1_000_000) return `${fmt(v / 1_000_000)} mi`;
  if (abs >= 1_000) return `${fmt(v / 1_000)} mil`;
  return new Intl.NumberFormat("pt-BR").format(v);
}

export function safeTitle(t?: string, max = 140): string {
  if (!t) return "";
  return t.length > max ? t.slice(0, max - 1) + "…" : t;
}

export function extractYouTubeId(input?: string | null): string | null {
  if (!input) return null;
  if (/^[a-zA-Z0-9_-]{11}$/.test(input)) return input;
  try {
    const u = new URL(input);
    if (u.hostname.includes("youtu.be")) {
      const id = u.pathname.split("/").filter(Boolean)[0];
      return id && /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    if (u.searchParams.has("v")) {
      const id = u.searchParams.get("v") || "";
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null;
    }
    const parts = u.pathname.split("/").filter(Boolean);
    const maybeId = parts[1] || parts[0] || "";
    return /^[a-zA-Z0-9_-]{11}$/.test(maybeId) ? maybeId : null;
  } catch {
    return null;
  }
}

export function ytThumbFromAny(row: any): string | null {
  if (row?.thumbnail_url) return row.thumbnail_url;
  const id = row?.youtube_id || extractYouTubeId(row?.youtube_url);
  return id ? `https://i.ytimg.com/vi/${id}/hqdefault.jpg` : null;
}

export function ytUrlFromAny(row: any): string | null {
  if (row?.youtube_url) return row.youtube_url;
  const id = row?.youtube_id || extractYouTubeId(row?.youtube_url);
  return id ? `https://www.youtube.com/watch?v=${id}` : null;
}

export async function runWithNotify<T>(
  run: () => Promise<T>,
  {
    success = "Operação realizada.",
    errorDefault = "Falha na operação.",
    onSuccess,
    onError,
  }: {
    success?: string;
    errorDefault?: string;
    onSuccess?: () => void;
    onError?: (e: any) => void;
  } = {},
): Promise<boolean> {
  try {
    await run();
    notifications.show({ message: success, color: "teal" });
    onSuccess?.();
    return true;
  } catch (e: any) {
    onError?.(e);
    const msg = e?.response?.data?.message ?? errorDefault;
    notifications.show({ message: msg, color: "red" });
    return false;
  }
}
