import { useQuery, keepPreviousData } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { fetchPage } from "@/api";
import type { PageResp, TableOptions } from "@/types";

export function useServerTable<T>(endpoint: string, opts?: TableOptions) {
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(opts?.initialPerPage ?? 10);
  const [search, setSearch] = useState(opts?.initialSearch ?? "");
  const [sort, setSort] = useState<string | undefined>(undefined);
  const [dir, setDir] = useState<"asc" | "desc">("asc");

  function setPerPageAndReset(n: number) {
    setPerPage(n);
    setPage(1);
  }

  function setSearchAndReset(q: string) {
    setSearch(q);
    setPage(1);
  }

  function toggleSort(nextKey: string) {
    if (sort === nextKey) setDir((d) => (d === "asc" ? "desc" : "asc"));
    else {
      setSort(nextKey);
      setDir("asc");
    }
    setPage(1);
  }

  const searchParamName = opts?.searchParam ?? "search";
  const trimmed = search?.trim();

  const params = useMemo(
    () => ({
      ...(opts?.baseParams ?? {}),
      page,
      per_page: perPage,
      ...(trimmed ? { [searchParamName]: trimmed } : {}),
      ...(sort ? { sort } : {}),
      ...(dir ? { direction: dir } : {}),
    }),
    [opts?.baseParams, page, perPage, trimmed, searchParamName, sort, dir],
  );

  const query = useQuery<PageResp<T>>({
    queryKey: [
      "table",
      endpoint,
      page,
      perPage,
      trimmed,
      searchParamName,
      sort ?? null,
      dir,
      opts?.baseParams ?? null,
      ...(opts?.queryKey ?? []),
    ],
    queryFn: () => fetchPage<T>(endpoint, params),
    placeholderData: keepPreviousData,
    staleTime: 1000,
    gcTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const rows = query.data?.data ?? [];
  const metaFromApi = query.data?.meta;
  const meta =
    metaFromApi ??
    ({
      current_page: page,
      last_page: Math.max(1, page),
      per_page: perPage,
      total: rows.length ?? 0,
    } as const);

  return {
    rows,
    meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    search,
    setSearch: setSearchAndReset,
    page,
    setPage,
    perPage,
    setPerPage: setPerPageAndReset,
    sort,
    dir,
    toggleSort,
  };
}
