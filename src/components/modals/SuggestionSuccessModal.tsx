import { Modal, Group, Title, Text, Button } from "@mantine/core";
import { IconCheck } from "@tabler/icons-react";
import type { ModalProps } from "@/types";

export function SuggestionSuccessModal({ open, onClose }: ModalProps) {
  return (
    <Modal
      opened={!!open}
      onClose={onClose ?? (() => {})}
      centered
      radius="md"
      withCloseButton={false}
    >
      <Group wrap="nowrap" align="flex-start">
        <div
          style={{
            width: 40,
            height: 40,
            borderRadius: 12,
            display: "grid",
            placeItems: "center",
            background: "var(--mantine-color-blue-1)",
          }}
        >
          <IconCheck size={22} />
        </div>
        <div>
          <Title order={4} mb={4}>
            Sugestão enviada!
          </Title>
          <Text c="dimmed" mb="sm">
            Obrigado pela colaboração. Sua sugestão será analisada e em breve
            será publicada.
          </Text>
          <Group justify="flex-end">
            <Button onClick={onClose}>Fechar</Button>
          </Group>
        </div>
      </Group>
    </Modal>
  );
}
