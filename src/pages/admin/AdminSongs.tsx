import { useState } from "react";
import { IconCheck, IconTrash, IconX } from "@tabler/icons-react";
import { Tabs, ActionIcon, Group } from "@mantine/core";
import { useYoutubeViewer, ServerTable } from "@/components";
import { formatViews } from "@/utils";
import {
  makeThumbCol,
  makeTitleCol,
  makeViewsCol,
  makeStatusBadgeCol,
} from "@/components";
import { useConfirmAndRun } from "@/hooks";
import { approveSuggestion, rejectSuggestion, deleteSongById } from "@/api";
import type { Song, Suggestion, TableColumn } from "@/types";

export function AdminSongs() {
  const { open } = useYoutubeViewer();
  const { confirmAndRun, ConfirmUI } = useConfirmAndRun();

  const [reload, setReload] = useState(0);

  async function handleApprove(id: number) {
    await confirmAndRun(
      {
        title: "Aprovar sugestão",
        message: "Confirma a aprovação desta sugestão?",
        confirmText: "Aprovar",
        success: "Sugestão aprovada.",
        errorDefault: "Falha ao aprovar.",
      },
      () => approveSuggestion(id),
      { onSuccess: () => setReload((n) => n + 1) },
    );
  }

  async function handleReject(id: number) {
    await confirmAndRun(
      {
        title: "Reprovar sugestão",
        message: "Confirma a reprovação desta sugestão?",
        confirmText: "Reprovar",
        danger: true,
        success: "Sugestão reprovada.",
        errorDefault: "Falha ao reprovar.",
      },
      () => rejectSuggestion(id),
      { onSuccess: () => setReload((n) => n + 1) },
    );
  }

  async function handleDeleteSong(id: number) {
    await confirmAndRun(
      {
        title: "Excluir música",
        message: "Esta ação é irreversível. Deseja continuar?",
        confirmText: "Excluir",
        danger: true,
        success: "Música excluída.",
        errorDefault: "Falha ao excluir música.",
      },
      () => deleteSongById(id),
      { onSuccess: () => setReload((n) => n + 1) },
    );
  }

  const suggestionCommonCols: TableColumn<Suggestion>[] = [
    makeThumbCol<Suggestion>(96, 54),
    makeTitleCol<Suggestion>((url, title) => open({ url, title })),
    {
      ...makeViewsCol<Suggestion>("view_count"),
      render: (s) => formatViews(s.view_count),
    },
  ];

  const historyCols: TableColumn<Suggestion>[] = [
    makeStatusBadgeCol<Suggestion>(),
    ...suggestionCommonCols,
    {
      key: "reviewed_at",
      header: "Revisado em",
      sortable: true,
      sortKey: "reviewed_at",
      render: (s) =>
        s.reviewed_at ? new Date(s.reviewed_at).toLocaleString("pt-BR") : "—",
    },
  ];

  const songCols: TableColumn<Song>[] = [
    makeThumbCol<Song>(96, 54),
    makeTitleCol<Song>((url, title) => open({ url, title })),
    { ...makeViewsCol<Song>("plays"), render: (s) => formatViews(s.plays) },
  ];

  return (
    <>
      <Tabs defaultValue="sugestoes" keepMounted={false}>
        <Tabs.List>
          <Tabs.Tab value="sugestoes">Sugestões</Tabs.Tab>
          <Tabs.Tab value="musicas">Músicas</Tabs.Tab>
          <Tabs.Tab value="historico">Histórico</Tabs.Tab>
        </Tabs.List>

        <Tabs.Panel value="sugestoes" pt="md">
          <div style={{ overflowX: "auto" }}>
            <ServerTable<Suggestion>
              title="Sugestões"
              endpoint="/suggestions"
              baseParams={{ status: "pending" }}
              queryKey={["suggestions", "pending", reload]}
              columns={suggestionCommonCols}
              actions={(s) => (
                <Group gap="xs" justify="flex-end" wrap="wrap">
                  <ActionIcon
                    variant="light"
                    color="green"
                    title="Aprovar"
                    onClick={() => handleApprove(s.id)}
                  >
                    <IconCheck size={18} />
                  </ActionIcon>
                  <ActionIcon
                    variant="light"
                    color="orange"
                    title="Reprovar"
                    onClick={() => handleReject(s.id)}
                  >
                    <IconX size={18} />
                  </ActionIcon>
                </Group>
              )}
              actionsColHeader="Ações"
              emptyText="Nenhuma sugestão pendente."
            />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="musicas" pt="md">
          <div style={{ overflowX: "auto" }}>
            <ServerTable<Song>
              title="Músicas"
              endpoint="/songs"
              queryKey={["songs", reload]}
              columns={songCols}
              actions={(s) => (
                <ActionIcon
                  variant="light"
                  color="red"
                  title="Excluir"
                  onClick={() => handleDeleteSong(s.id)}
                >
                  <IconTrash size={18} />
                </ActionIcon>
              )}
              actionsColHeader="Ações"
              emptyText="Nenhuma música cadastrada."
            />
          </div>
        </Tabs.Panel>

        <Tabs.Panel value="historico" pt="md">
          <div style={{ overflowX: "auto" }}>
            <ServerTable<Suggestion>
              title="Histórico"
              endpoint="/suggestions"
              baseParams={{ status_in: "approved,rejected,deleted" }}
              queryKey={["suggestions", "history", reload]}
              columns={historyCols}
              actions={(s) =>
                s.status === "rejected" || s.status === "deleted" ? (
                  <ActionIcon
                    variant="light"
                    color="green"
                    title="Reaprovar"
                    onClick={() => handleApprove(s.id)}
                  >
                    <IconCheck size={18} />
                  </ActionIcon>
                ) : null
              }
              actionsColHeader="Ações"
              emptyText="Nenhum item no histórico."
            />
          </div>
        </Tabs.Panel>
      </Tabs>

      {ConfirmUI}
    </>
  );
}
