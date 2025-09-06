import { useEffect, useState } from "react";
import {
  Card,
  Group,
  TextInput,
  Table,
  Select,
  Text,
  Loader,
  Title,
  Pagination,
  Stack,
  Button,
} from "@mantine/core";
import {
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
  IconSearch,
} from "@tabler/icons-react";
import { useServerTable } from "@/hooks";
import type { TableProps } from "@/types";

export function ServerTable<T>({
  endpoint,
  columns,
  baseParams,
  initialSearch,
  initialPerPage = 10,
  queryKey,
  emptyText = "Nenhum registro encontrado.",
  actionsColHeader = "Ações",
  actions,
  toolbarRight,
  title = "Lista",
}: TableProps<T>) {
  const {
    rows,
    meta,
    isLoading,
    isFetching,
    search,
    setSearch,
    page,
    setPage,
    perPage,
    setPerPage,
    sort,
    dir,
    toggleSort,
  } = useServerTable<T>(endpoint, {
    baseParams,
    initialSearch,
    initialPerPage,
    queryKey,
  });

  const [searchInput, setSearchInput] = useState(search);

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    setSearch(searchInput.trim());
    setPage(1);
  }

  useEffect(() => {
    const trimmed = searchInput.trim();
    if (trimmed === search) return;
    const handler = setTimeout(() => {
      setSearch(trimmed);
      setPage(1);
    }, 350);
    return () => clearTimeout(handler);
  }, [searchInput, search, setSearch, setPage]);

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") {
      setSearchInput("");
      setSearch("");
      setPage(1);
    }
  }

  const currentPage = page ?? 1;
  const lastPage = meta?.last_page ?? Math.max(currentPage, 1);
  const total = meta?.total ?? rows.length ?? 0;

  const rangeStart = total === 0 ? 0 : (currentPage - 1) * perPage + 1;
  const rangeEnd = Math.min(currentPage * perPage, total);

  return (
    <Card withBorder radius="md">
      <Card.Section inheritPadding py="md">
        <Group justify="space-between" align="center">
          <Title order={4}>{title}</Title>

          <Group
            gap="sm"
            wrap="nowrap"
            component="form"
            onSubmit={submitSearch}
          >
            <TextInput
              placeholder="Buscar..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.currentTarget.value)}
              onKeyDown={onKeyDown}
              leftSection={<IconSearch size={16} />}
              aria-label="Buscar"
            />
            {toolbarRight}
          </Group>
        </Group>
      </Card.Section>

      <Card.Section p="md">
        <div style={{ overflowX: "auto" }}>
          <Table
            striped
            highlightOnHover
            withRowBorders={false}
            verticalSpacing="sm"
            miw={600}
          >
            <Table.Thead>
              <Table.Tr>
                {columns.map((c) => {
                  const active = c.sortable && (c.sortKey ?? c.key) === sort;
                  const icon = !c.sortable ? null : active ? (
                    dir === "asc" ? (
                      <IconSortAscending size={16} />
                    ) : (
                      <IconSortDescending size={16} />
                    )
                  ) : (
                    <IconArrowsSort size={16} />
                  );

                  return (
                    <Table.Th
                      key={c.key}
                      className={c.className}
                      style={{ whiteSpace: "nowrap" }}
                    >
                      {c.sortable ? (
                        <Button
                          variant="subtle"
                          size="xs"
                          onClick={() => toggleSort(c.sortKey ?? c.key)}
                          leftSection={icon}
                        >
                          {c.header}
                        </Button>
                      ) : (
                        c.header
                      )}
                    </Table.Th>
                  );
                })}
                {!!actions && (
                  <Table.Th style={{ textAlign: "right" }}>
                    {actionsColHeader}
                  </Table.Th>
                )}
              </Table.Tr>
            </Table.Thead>

            <Table.Tbody>
              {isLoading && (
                <Table.Tr>
                  <Table.Td colSpan={columns.length + (actions ? 1 : 0)}>
                    <Group gap="xs">
                      <Loader size="sm" />
                      <Text c="dimmed">Carregando...</Text>
                    </Group>
                  </Table.Td>
                </Table.Tr>
              )}

              {!isLoading && rows.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={columns.length + (actions ? 1 : 0)}>
                    <Text c="dimmed">{emptyText}</Text>
                  </Table.Td>
                </Table.Tr>
              )}

              {!isLoading &&
                rows.map((row, i) => (
                  <Table.Tr key={i}>
                    {columns.map((c) => {
                      const content = c.render
                        ? c.render(row)
                        : c.accessor
                          ? c.accessor(row)
                          : (row as any)[c.key];
                      return (
                        <Table.Td key={c.key} className={c.className}>
                          {content ?? "—"}
                        </Table.Td>
                      );
                    })}
                    {!!actions && (
                      <Table.Td style={{ textAlign: "right" }}>
                        {actions(row)}
                      </Table.Td>
                    )}
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </div>
      </Card.Section>

      <Card.Section inheritPadding py="md">
        <Stack gap="xs">
          <Group justify="space-between" align="center" wrap="wrap">
            <Group gap="sm">
              <Text size="sm">Itens por página</Text>
              <Select
                value={String(perPage)}
                onChange={(v) => {
                  const n = parseInt(v || "10", 10);
                  setPerPage(n);
                  setPage(1);
                }}
                data={["10", "20", "50", "100"]}
                w={100}
              />
              {isFetching && (
                <Group gap={6}>
                  <Loader size="xs" />
                  <Text size="sm" c="dimmed">
                    Atualizando…
                  </Text>
                </Group>
              )}
            </Group>

            <Text size="sm" c="dimmed">
              {total > 0
                ? `Exibindo ${rangeStart}–${rangeEnd} de ${total}`
                : "Sem registros"}
            </Text>

            <Pagination
              value={currentPage}
              onChange={setPage}
              total={lastPage}
              boundaries={1}
              siblings={1}
              withEdges
              aria-label="Paginação"
            />
          </Group>
        </Stack>
      </Card.Section>
    </Card>
  );
}
