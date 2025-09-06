import { Card, Group, Text, Image, Box } from "@mantine/core";
import { IconBrandYoutube, IconEye } from "@tabler/icons-react";
import { safeTitle, formatViews } from "@/utils";

export function SongCard({
  title,
  thumb,
  views,
  onOpen,
  height = 68,
  withEye = true,
}: {
  title: string;
  thumb?: string | null;
  views?: number;
  onOpen: () => void;
  height?: number;
  withEye?: boolean;
}) {
  return (
    <Card
      withBorder
      radius="md"
      shadow="xs"
      p="sm"
      className="hover-raise"
      onClick={(e) => {
        e.preventDefault();
        onOpen();
      }}
      style={{ cursor: "pointer" }}
    >
      <Group align="center" gap="md" wrap="nowrap">
        <Image
          src={thumb || undefined}
          alt={title}
          w={120}
          h={height}
          radius="sm"
          fit="cover"
        />
        <Box style={{ flex: 1, minWidth: 0 }}>
          <Text
            fw={700}
            lineClamp={2}
            style={{ wordBreak: "break-word" }}
            title={title}
          >
            {safeTitle(title)}
          </Text>
          {withEye && (
            <Group gap={6} align="center" mt={4} wrap="nowrap">
              <IconEye size={14} />
              <Text fz="xs" c="dimmed">
                {formatViews(views)} visualizações
              </Text>
            </Group>
          )}
        </Box>
        <IconBrandYoutube size={20} />
      </Group>
    </Card>
  );
}
