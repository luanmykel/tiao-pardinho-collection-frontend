import { Group, Text, Anchor, Image, Badge, Tooltip } from "@mantine/core";
import { IconBrandYoutube } from "@tabler/icons-react";
import { ytThumbFromAny, ytUrlFromAny, safeTitle, formatViews } from "@/utils";

export const makeThumbCol = <T extends any>(w = 96, h = 54) => ({
  key: "thumb",
  header: "Thumb",
  className: "text-start",
  render: (row: T) => {
    const thumb = ytThumbFromAny(row);
    return thumb ? (
      <Image
        src={thumb}
        alt={(row as any).title || (row as any).youtube_id}
        w={w}
        h={h}
        radius="sm"
        fit="cover"
      />
    ) : (
      "—"
    );
  },
});

export const makeTitleCol = <T extends any>(
  openViewer: (url: string, title: string) => void,
) => ({
  key: "title",
  header: "Título",
  sortable: true,
  sortKey: "title",
  render: (row: T) => {
    const url = ytUrlFromAny(row);
    const label = (row as any).title || (row as any).youtube_id || "";
    return (
      <Group gap={6} wrap="nowrap" style={{ minWidth: 0 }}>
        <Text
          component="a"
          href={url || undefined}
          onClick={(e: any) => {
            e.preventDefault();
            if (url) openViewer(url, label);
          }}
          lineClamp={2}
          style={{ wordBreak: "break-word", minWidth: 0 }}
          title={label}
        >
          {safeTitle(label)}
        </Text>
        {url && (
          <Anchor
            href={url}
            target="_blank"
            rel="noreferrer"
            title="Abrir no YouTube"
          >
            <IconBrandYoutube size={16} />
          </Anchor>
        )}
      </Group>
    );
  },
});

export const makeViewsCol = <T extends any>(key: "plays" | "view_count") => ({
  key,
  header: "Views",
  className: "text-end",
  sortable: true,
  sortKey: key,
  render: (row: T) => formatViews((row as any)[key]),
});

export const makeStatusBadgeCol = <
  T extends { status?: string; removed_at?: string | null },
>() => ({
  key: "status",
  header: "Status",
  sortable: true,
  sortKey: "status",
  render: (row: T) => {
    if (row.status === "deleted") {
      const when = row.removed_at
        ? new Date(row.removed_at).toLocaleString("pt-BR")
        : null;
      const tip = when ? `Removida em ${when}` : "Removida";
      return (
        <Tooltip label={tip} withArrow>
          <Badge color="red" variant="light">
            Removida
          </Badge>
        </Tooltip>
      );
    }
    if (row.status === "approved")
      return (
        <Badge color="green" variant="light">
          Aprovada
        </Badge>
      );
    if (row.status === "rejected")
      return (
        <Badge color="orange" variant="light">
          Rejeitada
        </Badge>
      );
    return <Badge variant="light">{(row as any).status}</Badge>;
  },
});
