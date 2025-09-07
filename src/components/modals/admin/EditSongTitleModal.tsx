import { useEffect, useState } from "react";
import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { runWithNotify } from "@/utils";
import { updateSongTitle } from "@/api";
import type { Song } from "@/types";

type Props = {
  song: Song | null;
  onClose: () => void;
  onSaved: () => void;
};

export function EditSongTitleModal({ song, onClose, onSaved }: Props) {
  const [title, setTitle] = useState(song?.title ?? "");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldError, setFieldError] = useState<string | undefined>(undefined);

  useEffect(() => {
    setTitle(song?.title ?? "");
    setFormError(null);
    setFieldError(undefined);
  }, [song]);

  async function save() {
    if (!song) return;
    setLoading(true);
    setFormError(null);
    setFieldError(undefined);

    await runWithNotify(() => updateSongTitle(song.id, { title }), {
      success: "Título atualizado.",
      errorDefault: "Erro ao atualizar título.",
      onSuccess: onSaved,
      onError: (e) => {
        const res = e?.response?.data;
        setFormError(res?.message ?? "Erro ao atualizar título.");
        const errs = res?.errors ?? {};
        setFieldError(errs?.title?.[0]);
      },
    });
    setLoading(false);
  }

  if (!song) return null;

  return (
    <Modal opened onClose={onClose} centered title={`Editar título`}>
      <TextInput
        label="Título"
        value={title}
        onChange={(e) => {
          setTitle(e.currentTarget.value);
          if (fieldError) setFieldError(undefined);
        }}
        error={fieldError}
      />
      {formError && (
        <Text c="red" mt="sm">
          {formError}
        </Text>
      )}
      <Group justify="flex-end" mt="md">
        <Button variant="light" onClick={onClose}>
          Cancelar
        </Button>
        <Button onClick={save} loading={loading}>
          Salvar
        </Button>
      </Group>
    </Modal>
  );
}
