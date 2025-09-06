import { useState } from "react";
import {
  Button,
  Checkbox,
  Grid,
  Group,
  Modal,
  PasswordInput,
  Text,
  TextInput,
} from "@mantine/core";
import { createUser } from "@/api";
import { runWithNotify } from "@/utils";
import type { ModalProps } from "@/types";

export function NewUserModal({ open, onClose, onSaved }: ModalProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [isActive, setIsActive] = useState(true);

  const [loading, setLoading] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{
    name?: string;
    email?: string;
    password?: string;
    password_confirmation?: string;
    is_active?: string;
  }>({});

  function clearErrors() {
    setFormError(null);
    setFieldErrors({});
  }

  async function save() {
    setLoading(true);
    clearErrors();
    await runWithNotify(
      () =>
        createUser({
          name,
          email,
          password: pass,
          password_confirmation: pass2,
          is_active: isActive,
        }),
      {
        success: "Usuário criado com sucesso.",
        errorDefault: "Erro ao criar usuário.",
        onSuccess: onSaved,
        onError: (e) => {
          const res = e?.response?.data;
          setFormError(res?.message ?? "Erro ao criar usuário");
          const errs = res?.errors ?? {};
          setFieldErrors({
            name: errs?.name?.[0],
            email: errs?.email?.[0],
            password: errs?.password?.[0],
            password_confirmation: errs?.password_confirmation?.[0],
            is_active: errs?.is_active?.[0],
          });
        },
      },
    );
    setLoading(false);
  }

  return (
    <Modal
      opened={!!open}
      onClose={() => {
        clearErrors();
        onClose?.();
      }}
      centered
      title="Novo usuário"
    >
      <Grid>
        <Grid.Col span={12}>
          <TextInput
            label="Nome"
            value={name}
            onChange={(e) => {
              setName(e.currentTarget.value);
              if (fieldErrors.name)
                setFieldErrors((f) => ({ ...f, name: undefined }));
            }}
            error={fieldErrors.name}
          />
        </Grid.Col>
        <Grid.Col span={12}>
          <TextInput
            label="Email"
            value={email}
            onChange={(e) => {
              setEmail(e.currentTarget.value);
              if (fieldErrors.email)
                setFieldErrors((f) => ({ ...f, email: undefined }));
            }}
            error={fieldErrors.email}
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <PasswordInput
            label="Senha"
            value={pass}
            onChange={(e) => {
              setPass(e.currentTarget.value);
              if (fieldErrors.password)
                setFieldErrors((f) => ({ ...f, password: undefined }));
            }}
            error={fieldErrors.password}
            description="Mín. 8 caracteres."
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <PasswordInput
            label="Confirmar senha"
            value={pass2}
            onChange={(e) => {
              setPass2(e.currentTarget.value);
              if (fieldErrors.password_confirmation) {
                setFieldErrors((f) => ({
                  ...f,
                  password_confirmation: undefined,
                }));
              }
            }}
            error={fieldErrors.password_confirmation}
            description="Mesma senha."
          />
        </Grid.Col>
        <Grid.Col span={6}>
          <Checkbox
            label="Ativo"
            checked={isActive}
            onChange={(e) => {
              setIsActive(e.currentTarget.checked);
              if (fieldErrors.is_active)
                setFieldErrors((f) => ({ ...f, is_active: undefined }));
            }}
            error={fieldErrors.is_active}
          />
        </Grid.Col>
      </Grid>

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
