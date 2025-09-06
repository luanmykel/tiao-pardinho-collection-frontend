import { useState } from "react";
import { Outlet, Link, useLocation, useNavigate } from "react-router-dom";
import {
  IconHome,
  IconMusic,
  IconUsers,
  IconLogout,
  IconUser,
} from "@tabler/icons-react";
import { AppShell, NavLink, Group, Title, Stack, Burger } from "@mantine/core";
import { notifications } from "@mantine/notifications";
import { doLogout } from "@/api";
import { useConfirm, useAuthGate } from "@/hooks";

export function AdminLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  useAuthGate("require");

  const [opened, setOpened] = useState(false);
  const { confirm, ConfirmUI } = useConfirm();

  const isActive = (path: string) =>
    pathname === path || (path === "/admin" && pathname === "/admin/");

  const handleNav = () => setOpened(false);

  async function confirmLogout() {
    await doLogout();
    notifications.show({ message: "Sessão encerrada.", color: "teal" });
    navigate("/login");
  }

  return (
    <AppShell
      header={{ height: 64 }}
      navbar={{
        width: 240,
        breakpoint: "sm",
        collapsed: { mobile: !opened, desktop: false },
      }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="flex-start" gap="sm" wrap="nowrap">
          <Burger
            opened={opened}
            onClick={() => setOpened((o) => !o)}
            hiddenFrom="sm"
            size="sm"
            aria-label="Abrir menu"
          />
          <Title
            order={3}
            style={{
              overflow: "hidden",
              textOverflow: "ellipsis",
              whiteSpace: "nowrap",
            }}
          >
            Collection — Admin
          </Title>
        </Group>
      </AppShell.Header>

      <AppShell.Navbar p="md">
        <Stack gap="xs" style={{ flexGrow: 1 }}>
          <NavLink
            component={Link}
            to="/"
            label="Início"
            leftSection={<IconHome size={16} />}
            active={isActive("/")}
            variant="light"
            onClick={handleNav}
          />

          <NavLink
            component={Link}
            to="/admin"
            label="Sons"
            leftSection={<IconMusic size={16} />}
            active={isActive("/admin")}
            variant="light"
            onClick={handleNav}
          />
          <NavLink
            component={Link}
            to="/admin/users"
            label="Usuários"
            leftSection={<IconUsers size={16} />}
            active={isActive("/admin/users")}
            variant="light"
            onClick={handleNav}
          />
          <NavLink
            component={Link}
            to="/admin/profile"
            label="Meu perfil"
            leftSection={<IconUser size={16} />}
            active={isActive("/admin/profile")}
            variant="light"
            onClick={handleNav}
          />
        </Stack>

        <NavLink
          label="Sair"
          leftSection={<IconLogout size={16} />}
          onClick={async () => {
            const ok = await confirm({
              title: "Sair da conta",
              message: "Deseja encerrar a sessão?",
              confirmText: "Sair",
              danger: true,
            });
            if (ok) {
              await confirmLogout();
            }
          }}
          styles={{
            label: { color: "red" },
            section: { color: "red" },
            root: { "&:hover": { backgroundColor: "rgba(255,0,0,0.1)" } },
          }}
        />
      </AppShell.Navbar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      {ConfirmUI}
    </AppShell>
  );
}
