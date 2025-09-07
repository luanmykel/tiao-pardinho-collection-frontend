import { useState, useEffect } from "react";
import { Button, Group, Modal, Text, TextInput } from "@mantine/core";
import { runWithNotify } from "@/utils";
import { createSongFromYoutube } from "@/api";
import type { ModalProps } from "@/types";

export function AddSongModal({ open, onClose, onSaved }: ModalProps) {
  const [youtube, setYoutube] = useState("");
  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{ youtube?: string }>({});

  function clearErrors() {
    setFormError(null);
    setFieldErrors({});
  }

  useEffect(() => {
    if (open) {
      setYoutube("");
      clearErrors();
    }
  }, [open]);

  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (!open) return;
      if (e.key === "Escape") {
        e.stopPropagation();
        e.preventDefault();
        if (youtube.trim() !== "") {
          setYoutube("");
          clearErrors();
        } else {
          onClose?.();
        }
      }
    }

    window.addEventListener("keydown", handler, true);
    return () => window.removeEventListener("keydown", handler, true);
  }, [open, youtube]);

  async function save() {
    setLoading(true);
    clearErrors();
    await runWithNotify(() => createSongFromYoutube({ youtube }), {
      success: "Música adicionada.",
      errorDefault: "Erro ao adicionar música.",
      onSuccess: onSaved,
      onError: (e) => {
        const res = e?.response?.data;
        setFormError(res?.message ?? "Erro ao adicionar música");
        const errs = res?.errors ?? {};
        setFieldErrors({ youtube: errs?.youtube?.[0] });
      },
    });
    setLoading(false);
  }

  return (
    <Modal
      opened={!!open}
      closeOnEscape={false}
      onClose={() => {
        setYoutube("");
        clearErrors();
        onClose?.();
      }}
      centered
      title="Adicionar música do YouTube"
    >
      <TextInput
        label="Link do YouTube ou ID (11 caracteres)"
        placeholder="https://www.youtube.com/watch?v=XXXXXXXXXXX"
        value={youtube}
        onChange={(e) => {
          setYoutube(e.currentTarget.value);
          if (fieldErrors.youtube)
            setFieldErrors((f) => ({ ...f, youtube: undefined }));
        }}
        error={fieldErrors.youtube}
      />

      {formError && (
        <Text c="red" mt="sm">
          {formError}
        </Text>
      )}

      <Group justify="flex-end" mt="md">
        <Button
          variant="light"
          onClick={() => {
            clearErrors();
            onClose?.();
          }}
        >
          Cancelar
        </Button>
        <Button onClick={save} loading={loading}>
          Salvar
        </Button>
      </Group>
    </Modal>
  );
}
