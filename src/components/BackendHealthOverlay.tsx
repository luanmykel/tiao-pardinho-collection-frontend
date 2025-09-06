import { Modal, Text, Stack, Center } from "@mantine/core";
import { useEffect, useRef } from "react";
import { IconCloudOff } from "@tabler/icons-react";
import type { HealtProps } from "@/types";

export function BackendHealthOverlay({
  forceOpen = false,
  isDown,
  refetch,
}: HealtProps) {
  const opened = forceOpen || isDown;

  const kickedRef = useRef(false);
  useEffect(() => {
    if (opened && !kickedRef.current) {
      kickedRef.current = true;
      refetch();
    }
    if (!opened) {
      kickedRef.current = false;
    }
  }, [opened, refetch]);

  return (
    <Modal
      opened={opened}
      onClose={() => {}}
      withCloseButton={false}
      centered
      fullScreen
      keepMounted
      transitionProps={{ transition: "fade", duration: 150 }}
      overlayProps={{ opacity: 0.85, blur: 2 }}
      padding="lg"
    >
      <Center style={{ minHeight: "60vh" }}>
        <Stack align="center" gap="sm">
          <IconCloudOff size={64} />
          <Text fw={700} fz={24}>
            Ops... o backend não está respondendo
          </Text>
          <Text c="dimmed" ta="center">
            Estamos em manutenção ou ocorreu uma instabilidade.
          </Text>
        </Stack>
      </Center>
    </Modal>
  );
}
