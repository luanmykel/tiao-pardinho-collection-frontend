import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Button,
  Card,
  Container,
  PasswordInput,
  TextInput,
  Title,
  Stack,
  Center,
  Alert,
} from "@mantine/core";
import {
  IconMail,
  IconLock,
  IconAlertCircle,
  IconHome,
} from "@tabler/icons-react";
import { doLogin } from "@/api";
import { useAuthGate } from "@/hooks";
import { FloatingCornerButton } from "@/components";

export function Login() {
  const nav = useNavigate();
  useAuthGate("redirectIfAuthed");
  const [email, setEmail] = useState("");
  const [password, setPwd] = useState("");
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setLoading(true);
    try {
      await doLogin(email.trim(), password);
      nav("/admin", { replace: true });
    } catch (e: any) {
      setErr(e?.response?.data?.message ?? "Falha no login");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <FloatingCornerButton to="/" label="Ir para o início">
        <IconHome size={20} />
      </FloatingCornerButton>
      <Center h="100vh">
        <Container size={420}>
          <Card withBorder shadow="sm" radius="md" p="xl">
            <Title order={3} ta="center" mb="lg">
              Entrar
            </Title>

            {err && (
              <Alert
                icon={<IconAlertCircle size={16} />}
                title="Erro"
                color="red"
                mb="md"
              >
                {err}
              </Alert>
            )}

            <form onSubmit={submit}>
              <Stack>
                <TextInput
                  label="Email"
                  placeholder="voce@exemplo.com"
                  value={email}
                  onChange={(e) => setEmail(e.currentTarget.value)}
                  leftSection={<IconMail size={16} />}
                  required
                  type="email"
                  error={
                    email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
                      ? "Digite um endereço de e-mail válido"
                      : undefined
                  }
                />
                <PasswordInput
                  label="Senha"
                  placeholder="Sua senha"
                  value={password}
                  onChange={(e) => setPwd(e.currentTarget.value)}
                  leftSection={<IconLock size={16} />}
                  required
                />
                <Button type="submit" loading={loading} fullWidth>
                  Entrar
                </Button>
              </Stack>
            </form>
          </Card>
          <Title order={6} mt="md" ta="center" c="dimmed">
            © {new Date().getFullYear()} Coleção de Músicas – Tião Carreiro &
            Pardinho
          </Title>
        </Container>
      </Center>
    </>
  );
}
