import { Modal, Text, Group, Button } from "@mantine/core";
import type { ModalProps } from "@/types";

export function InfoModal({
  open,
  title = "Aviso",
  message,
  onClose,
}: ModalProps) {
  return (
    <Modal
      opened={!!open}
      onClose={onClose ?? (() => {})}
      centered
      radius="md"
      title={title}
    >
      <Text>{message}</Text>
      <Group justify="flex-end" mt="md">
        <Button onClick={onClose}>Entendi</Button>
      </Group>
    </Modal>
  );
}
