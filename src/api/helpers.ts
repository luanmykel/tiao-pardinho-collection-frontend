import { api } from "./api";
import type { PageResp } from "@/types";

export async function fetchPage<T>(
  url: string,
  params: {
    page?: number;
    per_page?: number;
    q?: string;
    sort?: string;
    direction?: "asc" | "desc";
    [k: string]: any;
  },
): Promise<PageResp<T>> {
  const { data } = await api.get(url, { params });
  return data as PageResp<T>;
}
