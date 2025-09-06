import { useRef, useEffect, useMemo, useState, useCallback } from "react";
import {
  Modal,
  Group,
  TextInput,
  Button,
  ScrollArea,
  Stack,
  Card,
  Image,
  Box,
  Text,
  Center,
  Loader,
  Pagination,
} from "@mantine/core";
import { useDebouncedValue } from "@mantine/hooks";
import {
  IconSearch,
  IconArrowsSort,
  IconSortAscending,
  IconSortDescending,
  IconEye,
} from "@tabler/icons-react";
import { useYoutubeViewer } from "@/components";
import { fetchAllSongsPublic } from "@/api";
import { formatViews, safeTitle } from "@/utils";
import type { ModalProps } from "@/types";
function extractViews(s: any): number | undefined {
  return typeof s?.plays === "number" ? s.plays : undefined;
}

export function SearchSongsModal({ open, onClose }: ModalProps) {
  const { open: openYT } = useYoutubeViewer();
  const inputRef = useRef<HTMLInputElement>(null);

  const [allSongs, setAllSongs] = useState<any[]>([]);
  const [loadingAll, setLoadingAll] = useState(false);

  const [q, setQ] = useState("");
  const [page, setPage] = useState(1);

  const [sort, setSort] = useState<"title" | "views">("title");
  const [dir, setDir] = useState<"asc" | "desc">("asc");
  const toggleSort = useCallback(
    (key: "title" | "views") => {
      if (sort === key) {
        setDir((d) => (d === "asc" ? "desc" : "asc"));
      } else {
        setSort(key);
        setDir("asc");
      }
      setPage(1);
    },
    [sort],
  );

  const [qDebounced] = useDebouncedValue(q, 200);
  const PER_PAGE = 10;

  async function loadAllSongs() {
    setLoadingAll(true);
    try {
      const acc = await fetchAllSongsPublic();
      setAllSongs(acc);
    } finally {
      setLoadingAll(false);
    }
  }

  useEffect(() => {
    if (!open) return;
    setQ("");
    setPage(1);

    if (allSongs.length === 0 && !loadingAll) {
      loadAllSongs();
    }

    const t = setTimeout(() => inputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (q.trim() !== "") {
          e.preventDefault();
          setQ("");
          setPage(1);
          inputRef.current?.focus();
        } else {
          onClose?.();
        }
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, q, onClose]);

  const filtered = useMemo(() => {
    const term = qDebounced.trim().toLowerCase();
    let base = allSongs;
    if (term) {
      base = base.filter((s) => {
        const t = `${s?.title ?? ""} ${s?.artist ?? ""}`.toLowerCase();
        return t.includes(term);
      });
    }
    const sorted = [...base].sort((a, b) => {
      let av: any, bv: any;
      if (sort === "title") {
        av = (a?.title ?? "").toString().toLowerCase();
        bv = (b?.title ?? "").toString().toLowerCase();
      } else {
        av = extractViews(a) ?? 0;
        bv = extractViews(b) ?? 0;
      }
      if (av < bv) return dir === "asc" ? -1 : 1;
      if (av > bv) return dir === "asc" ? 1 : -1;
      return 0;
    });
    return sorted;
  }, [allSongs, qDebounced, sort, dir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));

  useEffect(() => {
    if (page > totalPages) setPage(totalPages);
    else if (page < 1) setPage(1);
  }, [totalPages, page]);

  const slice = useMemo(() => {
    const start = (page - 1) * PER_PAGE;
    return filtered.slice(start, start + PER_PAGE);
  }, [filtered, page]);

  return (
    <Modal
      opened={!!open}
      onClose={onClose ?? (() => {})}
      size="lg"
      radius="md"
      title="Buscar músicas"
      closeOnEscape={false}
    >
      <Group align="end" mb="md" wrap="nowrap">
        <TextInput
          style={{ flex: 1 }}
          leftSection={<IconSearch size={16} />}
          placeholder="Digite o título desejado…"
          value={q}
          ref={inputRef}
          autoFocus
          onChange={(e) => {
            setQ(e.currentTarget.value);
            setPage(1);
          }}
        />
      </Group>

      <Group gap="sm" c="dimmed" fz="xs" px={6} pb="xs" wrap="nowrap">
        <Text w={120}></Text>
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Button
            variant="subtle"
            size="xs"
            onClick={() => toggleSort("title")}
            leftSection={
              sort !== "title" ? (
                <IconArrowsSort size={14} />
              ) : dir === "asc" ? (
                <IconSortAscending size={14} />
              ) : (
                <IconSortDescending size={14} />
              )
            }
            styles={{ section: { marginRight: 6 } }}
          >
            Título
          </Button>
        </Box>
        <Box w={120} style={{ textAlign: "right" }}>
          <Button
            variant="subtle"
            size="xs"
            onClick={() => toggleSort("views")}
            leftSection={
              sort !== "views" ? (
                <IconArrowsSort size={14} />
              ) : dir === "asc" ? (
                <IconSortAscending size={14} />
              ) : (
                <IconSortDescending size={14} />
              )
            }
          >
            Views
          </Button>
        </Box>
      </Group>

      <ScrollArea.Autosize mah={420} type="auto">
        {loadingAll ? (
          <Center py="md">
            <Loader size="sm" />
            <Text ml="xs" c="dimmed">
              Carregando…
            </Text>
          </Center>
        ) : slice.length === 0 ? (
          <Text c="dimmed" px="xs">
            Nenhum resultado.
          </Text>
        ) : (
          <Stack gap="xs" px="xs" py="xs">
            {slice.map((s: any, i: number) => {
              const views = extractViews(s);
              return (
                <Card
                  key={s.id ?? i}
                  withBorder
                  radius="md"
                  shadow="xs"
                  p="sm"
                  className="hover-raise"
                  onClick={(e) => {
                    e.preventDefault();
                    openYT({ url: s.youtube_url, title: s.title });
                  }}
                  style={{
                    cursor: "pointer",
                    position: "relative",
                    zIndex: 1,
                  }}
                >
                  <Group align="center" gap="md" wrap="nowrap">
                    <Image
                      src={s.thumbnail_url || undefined}
                      alt={s.title}
                      w={120}
                      h={68}
                      radius="sm"
                      fit="cover"
                    />
                    <Box style={{ flex: 1, minWidth: 0 }}>
                      <Text
                        fw={700}
                        lineClamp={2}
                        style={{ wordBreak: "break-word" }}
                        title={s.title}
                      >
                        {safeTitle(s.title)}
                      </Text>
                      {s.artist && (
                        <Text
                          fz="xs"
                          c="dimmed"
                          mt={4}
                          lineClamp={1}
                          title={s.artist}
                        >
                          {s.artist}
                        </Text>
                      )}
                    </Box>
                    <Group gap={6} align="center" wrap="nowrap">
                      <IconEye size={14} />
                      <Text fz="xs" c="dimmed">
                        {formatViews(views)}
                      </Text>
                    </Group>
                  </Group>
                </Card>
              );
            })}
          </Stack>
        )}
      </ScrollArea.Autosize>

      <Group justify="space-between" mt="md" wrap="wrap">
        <Text size="sm" c="dimmed">
          {filtered.length} resultados • página {page} de {totalPages}
        </Text>
        <Pagination
          total={totalPages}
          value={page}
          onChange={setPage}
          size="sm"
          boundaries={1}
          siblings={1}
          withEdges
          disabled={totalPages <= 1}
        />
      </Group>
    </Modal>
  );
}
