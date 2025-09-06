import { useEffect, useMemo, useState } from "react";
import { me, deleteUser } from "@/api";
import { Avatar, Badge, Button, Group, Text } from "@mantine/core";
import { IconPlus, IconPencil, IconTrash, IconKey } from "@tabler/icons-react";
import { useConfirmAndRun } from "@/hooks";
import { ServerTable } from "@/components";
import {
  NewUserModal,
  EditUserModal,
  PasswordModal,
} from "@/components/modals/admin";
import type { User, TableColumn } from "@/types";

export function AdminUsers() {
  const { confirmAndRun, ConfirmUI } = useConfirmAndRun();

  const [meUser, setMeUser] = useState<User | null>(null);
  useEffect(() => {
    me()
      .then(setMeUser)
      .catch(() => {});
  }, []);
  const meId = meUser?.id ?? 0;

  const [reload, setReload] = useState(0);
  const bump = () => setReload((n) => n + 1);

  const [openNew, setOpenNew] = useState(false);
  const [openEdit, setOpenEdit] = useState<User | null>(null);
  const [openPass, setOpenPass] = useState<User | null>(null);

  const cols: TableColumn<User>[] = useMemo(
    () => [
      {
        key: "avatar",
        header: "",
        className: "",
        render: (u) => (
          <Avatar
            src={u.avatar_url ?? undefined}
            alt={u.name}
            radius="xl"
            size={36}
          />
        ),
      },
      {
        key: "name",
        header: "Nome",
        sortable: true,
        sortKey: "name",
        render: (u) => (
          <Group gap={6}>
            <Text>{u.name}</Text>
            {meId && u.id === meId && (
              <Badge color="blue" variant="light">
                Você
              </Badge>
            )}
          </Group>
        ),
      },
      { key: "email", header: "Email", sortable: true, sortKey: "email" },
      {
        key: "is_active",
        header: "Status",
        sortable: true,
        sortKey: "is_active",
        render: (u) =>
          u.is_active ? (
            <Badge color="green" variant="light">
              Ativo
            </Badge>
          ) : (
            <Badge color="orange" variant="light">
              Inativo
            </Badge>
          ),
      },
    ],
    [meId],
  );

  return (
    <>
      <div style={{ overflowX: "auto" }}>
        <ServerTable<User>
          title="Usuários"
          endpoint="/admin/users"
          baseParams={{ active: true }}
          columns={cols}
          queryKey={["users", reload]}
          toolbarRight={
            <Button
              leftSection={<IconPlus size={16} />}
              onClick={() => setOpenNew(true)}
            >
              Usuário
            </Button>
          }
          actions={(u) => (
            <Group gap="xs" justify="flex-end" wrap="wrap">
              <Button
                size="xs"
                variant="light"
                leftSection={<IconPencil size={14} />}
                onClick={() => setOpenEdit(u)}
              >
                Editar
              </Button>
              <Button
                size="xs"
                variant="light"
                leftSection={<IconKey size={14} />}
                onClick={() => setOpenPass(u)}
              >
                Senha
              </Button>

              {u.id !== meId && (
                <Button
                  size="xs"
                  color="red"
                  variant="light"
                  leftSection={<IconTrash size={14} />}
                  onClick={async () => {
                    await confirmAndRun(
                      {
                        title: "Excluir usuário",
                        message: "Confirma a exclusão deste usuário?",
                        confirmText: "Excluir",
                        danger: true,
                        success: "Usuário excluído.",
                        errorDefault: "Falha ao excluir usuário.",
                      },
                      () => deleteUser(u.id),
                      { onSuccess: bump },
                    );
                  }}
                >
                  Excluir
                </Button>
              )}
            </Group>
          )}
          actionsColHeader="Ações"
          emptyText="Nenhum usuário."
        />

        <NewUserModal
          open={openNew}
          onClose={() => setOpenNew(false)}
          onSaved={() => {
            setOpenNew(false);
            bump();
          }}
        />
        {openEdit && (
          <EditUserModal
            user={openEdit}
            meId={meId}
            onClose={() => setOpenEdit(null)}
            onSaved={() => {
              setOpenEdit(null);
              bump();
            }}
          />
        )}
        {openPass && (
          <PasswordModal
            user={openPass}
            onClose={() => setOpenPass(null)}
            onSaved={() => {
              setOpenPass(null);
            }}
          />
        )}

        {ConfirmUI}
      </div>
    </>
  );
}
