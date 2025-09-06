import { useState } from "react";
import {
  Button,
  Checkbox,
  Grid,
  Group,
  Modal,
  Text,
  TextInput,
} from "@mantine/core";
import { updateUser } from "@/api";
import type { UserEditProps } from "@/types";
import { runWithNotify } from "@/utils";

export function EditUserModal({ user, meId, onClose, onSaved }: UserEditProps) {
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [isActive, setIsActive] = useState(user.is_active);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const canToggleSelfActive = user.id !== meId;

  async function save() {
    setLoading(true);
    setErr(null);
    await runWithNotify(
      () =>
        updateUser(user.id, {
          name,
          email,
          ...(canToggleSelfActive ? { is_active: isActive } : {}),
        }),
      {
        success: "Usuário atualizado.",
        errorDefault: "Erro ao atualizar usuário.",
        onSuccess: onSaved,
        onError: (e) =>
          setErr(e?.response?.data?.message ?? "Erro ao atualizar usuário"),
      },
    );
    setLoading(false);
  }

  return (
    <Modal opened onClose={onClose} centered title={`Editar: ${user.name}`}>
      <Grid>
        <Grid.Col span={12}>
          <TextInput
            label="Nome"
            value={name}
            onChange={(e) => setName(e.currentTarget.value)}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label="Email"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Checkbox
            label="Ativo"
            checked={isActive}
            onChange={(e) => setIsActive(e.currentTarget.checked)}
            disabled={!canToggleSelfActive}
          />
        </Grid.Col>
      </Grid>
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
