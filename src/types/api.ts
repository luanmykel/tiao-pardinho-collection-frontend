export type PageMeta = {
  current_page: number;
  per_page: number;
  total: number;
  last_page: number;
};
export type PageResp<T> = { data: T[]; meta: PageMeta };
