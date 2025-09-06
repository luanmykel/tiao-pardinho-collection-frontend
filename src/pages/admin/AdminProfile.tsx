import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Button,
  Card,
  CardSection,
  FileInput,
  Grid,
  Group,
  Image,
  Loader,
  Stack,
  Text,
  Title,
} from "@mantine/core";
import { me, uploadAvatar, clearAvatar } from "@/api";
import { useState } from "react";
import { notifications } from "@mantine/notifications";
import { useConfirmAndRun } from "@/hooks";

export function AdminProfile() {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({ queryKey: ["me"], queryFn: me });

  const { confirmAndRun, ConfirmUI } = useConfirmAndRun();

  const mAvatar = useMutation({
    mutationFn: uploadAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      notifications.show({
        message: "Avatar atualizado com sucesso.",
        color: "teal",
      });
    },
    onError: (e: any) => {
      notifications.show({
        message: e?.response?.data?.message ?? "Falha ao atualizar avatar.",
        color: "red",
      });
    },
  });

  const mClear = useMutation({
    mutationFn: clearAvatar,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["me"] });
      notifications.show({ message: "Avatar removido.", color: "teal" });
    },
    onError: (e: any) => {
      notifications.show({
        message: e?.response?.data?.message ?? "Falha ao remover avatar.",
        color: "red",
      });
    },
  });

  if (isLoading || !data) {
    return (
      <Card withBorder radius="md" p="lg">
        <Stack align="center" gap="xs">
          <Loader />
          <Text c="dimmed" size="sm">
            Carregando…
          </Text>
        </Stack>
      </Card>
    );
  }

  return (
    <>
      <Grid>
        <Grid.Col span={{ base: 12, md: 5 }}>
          <Card withBorder radius="md">
            <Title order={4}>Perfil</Title>
            <div style={{ marginTop: 12 }}>
              <Text size="sm" c="dimmed">
                Nome
              </Text>
              <Text mb="sm">{data.name}</Text>
              <Text size="sm" c="dimmed">
                Email
              </Text>
              <Text>{data.email}</Text>
            </div>
          </Card>
        </Grid.Col>

        <Grid.Col span={{ base: 12, md: 7 }}>
          <Card withBorder radius="md">
            <Title order={4}>Avatar</Title>
            <Text c="dimmed" size="sm" mb="md">
              Envie uma imagem para seu perfil.
            </Text>
            <Group align="flex-start" gap="lg" wrap="wrap">
              <div style={{ width: 120, flex: "0 0 120px" }}>
                <CardSection p="xs" withBorder style={{ borderRadius: 12 }}>
                  <Image
                    src={data.avatar_url ?? undefined}
                    alt="Avatar"
                    radius="md"
                    fallbackSrc="https://placehold.co/240x240?text=Avatar"
                  />
                </CardSection>
              </div>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                }}
                style={{ flex: 1, minWidth: 240 }}
              >
                <FilePicker
                  onPick={(file) => file && mAvatar.mutate(file)}
                  loading={mAvatar.isPending}
                />
                <Group mt="sm">
                  <Button
                    variant="light"
                    color="red"
                    onClick={async () => {
                      await confirmAndRun(
                        {
                          title: "Remover avatar",
                          message:
                            "Confirma a remoção do avatar? Esta ação não pode ser desfeita.",
                          confirmText: "Remover",
                          danger: true,
                          errorDefault: "Falha ao remover avatar.",
                        },
                        () => mClear.mutateAsync(),
                      );
                    }}
                    loading={mClear.isPending}
                  >
                    Limpar avatar
                  </Button>
                </Group>
              </form>
            </Group>
          </Card>
        </Grid.Col>
      </Grid>

      {ConfirmUI}
    </>
  );
}

function FilePicker({
  onPick,
  loading,
}: {
  onPick: (file: File | null) => void;
  loading: boolean;
}) {
  const [file, setFile] = useState<File | null>(null);
  return (
    <Group align="end" gap="sm" wrap="wrap">
      <FileInput
        label="Selecionar imagem"
        placeholder="Escolha um arquivo..."
        accept="image/*"
        value={file}
        onChange={setFile}
        style={{ flex: 1, minWidth: 220 }}
      />
      <Button
        onClick={() => onPick(file)}
        loading={loading}
        disabled={!file}
        w={{ base: "100%", sm: "auto" }}
      >
        Enviar
      </Button>
    </Group>
  );
}
