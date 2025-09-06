import { useState } from "react";
import { Button, Group, Modal, PasswordInput, Text } from "@mantine/core";
import { updateUserPassword } from "@/api";
import type { UserProps } from "@/types";
import { runWithNotify } from "@/utils";

export function PasswordModal({ user, onClose, onSaved }: UserProps) {
  const [p1, setP1] = useState("");
  const [p2, setP2] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function save() {
    setLoading(true);
    setErr(null);
    await runWithNotify(
      () =>
        updateUserPassword(user.id, {
          password: p1,
          password_confirmation: p2,
        }),
      {
        success: "Senha atualizada.",
        errorDefault: "Erro ao atualizar senha.",
        onSuccess: onSaved,
        onError: (e) =>
          setErr(e?.response?.data?.message ?? "Erro ao atualizar senha"),
      },
    );
    setLoading(false);
  }

  return (
    <Modal
      opened
      onClose={onClose}
      centered
      title={`Alterar senha: ${user.name}`}
    >
      <PasswordInput
        label="Nova senha"
        value={p1}
        onChange={(e) => setP1(e.currentTarget.value)}
        mb="sm"
      />
      <PasswordInput
        label="Confirmar nova senha"
        value={p2}
        onChange={(e) => setP2(e.currentTarget.value)}
      />
      {err && (
        <Text c="red" mt="sm">
          {err}
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
