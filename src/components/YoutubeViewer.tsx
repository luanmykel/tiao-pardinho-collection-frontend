import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { Modal, Group, Text, Anchor, AspectRatio } from "@mantine/core";
import { IconBrandYoutube } from "@tabler/icons-react";
import type { VideoState, Ctx, OpenArgs } from "@/types";
import { extractYouTubeId } from "@/utils";

const YoutubeViewerCtx = createContext<Ctx | null>(null);

export function YoutubeViewerProvider({ children }: { children: ReactNode }) {
  const [video, setVideo] = useState<VideoState>(null);

  const open = useCallback((args: OpenArgs) => {
    const id = args.id ?? extractYouTubeId(args.url ?? null);
    if (!id) return;
    setVideo({ id, title: args.title, url: args.url });
  }, []);

  const close = useCallback(() => setVideo(null), []);

  const embedSrc = useMemo(() => {
    if (!video?.id) return "";
    return `https://www.youtube-nocookie.com/embed/${video.id}?autoplay=1&rel=0`;
  }, [video]);

  const ctxValue = useMemo<Ctx>(() => ({ open }), [open]);

  return (
    <YoutubeViewerCtx.Provider value={ctxValue}>
      {children}

      <Modal
        opened={!!video}
        onClose={close}
        centered
        withCloseButton
        size="auto"
        withinPortal
        zIndex={5000}
        overlayProps={{ zIndex: 4990 }}
        title={
          <Group justify="space-between" wrap="nowrap" gap="md">
            <Text fw={700} size="sm" style={{ lineHeight: 1.2, flex: 1 }}>
              {video?.title ?? "Assistir no YouTube"}
            </Text>
            {video && (
              <Anchor
                href={
                  video.url
                    ? video.url
                    : `https://www.youtube.com/watch?v=${video.id}`
                }
                target="_blank"
                rel="noreferrer"
                aria-label="Ver no YouTube"
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  padding: "4px 8px",
                  borderRadius: 8,
                  background: "rgba(255,0,0,0.1)",
                  color: "#cc0000",
                  fontSize: 13,
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                <IconBrandYoutube size={16} />
                Ver no YouTube
              </Anchor>
            )}
          </Group>
        }
      >
        {video && (
          <div style={{ width: "min(90vw, 900px)" }}>
            <AspectRatio ratio={16 / 9}>
              <iframe
                src={embedSrc}
                title={video.title ?? "YouTube"}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                allowFullScreen
                frameBorder={0}
                style={{ width: "100%", height: "100%" }}
              />
            </AspectRatio>
          </div>
        )}
      </Modal>
    </YoutubeViewerCtx.Provider>
  );
}

export function useYoutubeViewer() {
  const ctx = useContext(YoutubeViewerCtx);
  if (!ctx)
    throw new Error(
      "useYoutubeViewer deve ser usado dentro de <YoutubeViewerProvider>.",
    );
  return ctx;
}
