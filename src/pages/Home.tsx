import { useRef, useState } from "react";
import { Link } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import {
  BackgroundImage,
  Overlay,
  Container,
  Group,
  Title,
  Text,
  Card,
  Image,
  Stack,
  Box,
  ActionIcon,
  useComputedColorScheme,
} from "@mantine/core";
import { Carousel } from "@mantine/carousel";
import Autoplay from "embla-carousel-autoplay";
import {
  IconBrandYoutube,
  IconChevronLeft,
  IconChevronRight,
  IconEye,
  IconSearch,
  IconLayoutDashboard,
  IconLogin2,
} from "@tabler/icons-react";
import { SearchSongsModal } from "@/components/modals";
import {
  useYoutubeViewer,
  SuggestionForm,
  FloatingCornerButton,
} from "@/components";
import { SongCard } from "@/components";
import { fetchTopSongs, fetchRestSongs } from "@/api";
import { useAuthGate } from "@/hooks";
import heroBg from "@/assets/background.jpg";
import duoImg from "@/assets/tiao-carreiro-pardinho.png";
import { formatViews, safeTitle } from "@/utils";

function extractViews(s: any): number | undefined {
  return typeof s?.plays === "number" ? s.plays : undefined;
}

export function Home() {
  const scheme = useComputedColorScheme("light", {
    getInitialValueInEffect: true,
  });
  const isDark = scheme === "dark";
  const autoplay = useRef(Autoplay({ delay: 2500, stopOnInteraction: true }));
  const { open } = useYoutubeViewer();

  const { data: top } = useQuery({
    queryKey: ["top"],
    queryFn: () => fetchTopSongs(5),
  });
  const { data: rest } = useQuery({
    queryKey: ["rest"],
    queryFn: () => fetchRestSongs({ top: 5, per_page: 10 }),
  });

  const authed = useAuthGate("track");

  const [openSearch, setOpenSearch] = useState(false);

  const THUMB_H = 150;
  const TITLE_H = 56;

  const topArr = Array.isArray(top) ? top : [];
  const slides = Array.isArray(rest?.data) ? rest!.data : [];

  return (
    <>
      <BackgroundImage
        src={heroBg}
        h={420}
        className="hero-fullbleed"
        style={{ position: "relative", overflow: "hidden" }}
      >
        {isDark ? (
          <>
            <Overlay
              gradient="linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.55))"
              zIndex={0}
              style={{ pointerEvents: "none" }}
            />
            <Overlay
              color="#0b0b0b"
              opacity={0.25}
              zIndex={0}
              style={{ pointerEvents: "none" }}
            />
          </>
        ) : (
          <>
            <Overlay
              gradient="linear-gradient(180deg, rgba(0,0,0,.55), rgba(0,0,0,.55))"
              zIndex={0}
              style={{ pointerEvents: "none" }}
            />
            <Overlay
              color="#0b0b0b"
              opacity={0.1}
              zIndex={0}
              style={{ pointerEvents: "none" }}
            />
          </>
        )}

        <Container
          size="md"
          h="100%"
          style={{ position: "relative", zIndex: 1 }}
        >
          <FloatingCornerButton
            to={authed ? "/admin" : "/login"}
            label={authed ? "Ir para o Admin" : "Fazer login"}
          >
            {authed ? (
              <IconLayoutDashboard size={20} />
            ) : (
              <IconLogin2 size={20} />
            )}
          </FloatingCornerButton>
          <ActionIcon
            variant="light"
            size="lg"
            aria-label="Buscar"
            onClick={() => setOpenSearch(true)}
            style={{ position: "fixed", top: 16, right: 56, zIndex: 10000 }}
          >
            <IconSearch size={20} />
          </ActionIcon>

          <Stack justify="center" align="center" h="100%" c="white">
            <Box
              component={Link}
              to="/"
              style={{
                width: 140,
                height: 140,
                borderRadius: "16px",
                overflow: "hidden",
                border: "1px solid rgba(255,255,255,.6)",
                boxShadow: "0 8px 24px rgba(0,0,0,.35)",
                background: "white",
                cursor: "pointer",
              }}
            >
              <img
                src={duoImg}
                alt="Tião Carreiro & Pardinho"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
            <Title order={1} className="hero-title">
              Coleção de Músicas
            </Title>
            <Text size="lg" style={{ opacity: 0.9 }}>
              Tião Carreiro & Pardinho
            </Text>
          </Stack>
        </Container>
      </BackgroundImage>

      <Container size="md" py="xl">
        <Card withBorder shadow="sm" radius="md" p="lg" mb="xl">
          <Title order={5} mb="sm">
            Sugerir Nova Música
          </Title>
          <SuggestionForm />
        </Card>

        <Title order={3} mb="sm">
          Mais Tocadas
        </Title>

        <Stack gap="sm">
          {topArr.map((s: any, i: number) => {
            const views = extractViews(s);
            return (
              <Group key={s.id ?? i} gap="sm" wrap="nowrap" align="stretch">
                <Text fw={800} fz={26} w={34} ta="right">
                  {i + 1}
                </Text>
                <Box style={{ flex: 1 }}>
                  <SongCard
                    title={s?.title ?? ""}
                    thumb={s?.thumbnail_url ?? undefined}
                    views={views ?? 0}
                    height={68}
                    onOpen={() =>
                      open({ url: s?.youtube_url, title: s?.title ?? "" })
                    }
                  />
                </Box>
              </Group>
            );
          })}
        </Stack>

        <Title order={4} mt="xl" mb="sm">
          Coleção
        </Title>
        <Carousel
          slideSize={{ base: "45%", sm: "33.333%", md: "25%", lg: "20%" }}
          slideGap="md"
          align="start"
          withIndicators={false}
          withControls
          loop
          nextControlIcon={<IconChevronRight size={18} />}
          previousControlIcon={<IconChevronLeft size={18} />}
          plugins={[autoplay.current]}
        >
          {slides.map((s: any, idx: number) => {
            const views = extractViews(s);
            return (
              <Carousel.Slide key={s.id ?? idx}>
                <Card
                  withBorder
                  shadow="xs"
                  radius="md"
                  p={0}
                  className="hover-soft"
                  onClick={(e) => {
                    e.preventDefault();
                    open({ url: s?.youtube_url, title: s?.title ?? "" });
                  }}
                  style={{
                    display: "flex",
                    flexDirection: "column",
                    height: THUMB_H + TITLE_H,
                    position: "relative",
                    overflow: "hidden",
                    cursor: "pointer",
                  }}
                >
                  <Box style={{ position: "relative" }}>
                    <Image
                      src={s.thumbnail_url || undefined}
                      alt={s?.title ?? ""}
                      h={THUMB_H}
                      fit="cover"
                    />
                    <Group
                      gap={6}
                      align="center"
                      style={{
                        position: "absolute",
                        right: 8,
                        bottom: 8,
                        padding: "4px 8px",
                        borderRadius: 999,
                        backdropFilter: "blur(6px)",
                        background: "rgba(0,0,0,.45)",
                      }}
                    >
                      <IconEye size={14} color="white" />
                      <Text fz="xs" c="white">
                        {formatViews(views)}
                      </Text>
                    </Group>
                  </Box>
                  <Box
                    p="sm"
                    style={{
                      height: TITLE_H,
                      display: "flex",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      fw={600}
                      fz="sm"
                      lineClamp={2}
                      style={{ wordBreak: "break-word" }}
                      title={s.title}
                    >
                      {safeTitle(s?.title ?? "")}
                    </Text>
                  </Box>
                </Card>
              </Carousel.Slide>
            );
          })}
        </Carousel>
      </Container>
      <SearchSongsModal
        open={openSearch}
        onClose={() => setOpenSearch(false)}
      />

      <Box
        component="footer"
        mt="xl"
        py="md"
        style={{
          borderTop: "1px solid var(--mantine-color-default-border)",
          background: "var(--mantine-color-body)",
        }}
      >
        <Container size="md">
          <Group justify="space-between">
            <Text size="sm" c="dimmed">
              © {new Date().getFullYear()} Coleção de Músicas – Tião Carreiro &
              Pardinho
            </Text>
            <Group gap="xs">
              <a
                href="https://www.youtube.com/results?search_query=Ti%C3%A3o+Carreiro+%26+Pardinho"
                target="_blank"
                rel="noopener noreferrer"
              >
                <IconBrandYoutube size={18} />
              </a>
            </Group>
          </Group>
        </Container>
      </Box>
    </>
  );
}
