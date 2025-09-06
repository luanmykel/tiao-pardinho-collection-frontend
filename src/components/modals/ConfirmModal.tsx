import { Modal, Text, Group, Button } from "@mantine/core";
import type { ModalProps } from "@/types";

export function ConfirmModal({
  open,
  title,
  message,
  confirmText = "Confirmar",
  cancelText = "Cancelar",
  onConfirm,
  onClose,
  danger = false,
}: ModalProps) {
  return (
    <Modal
      opened={!!open}
      onClose={onClose ?? (() => {})}
      centered
      title={title}
    >
      {typeof message === "string" ? <Text>{message}</Text> : message}

      <Group justify="flex-end" mt="md">
        <Button variant="light" onClick={onClose}>
          {cancelText}
        </Button>
        <Button
          color={danger ? "red" : "blue"}
          onClick={() => {
            onConfirm?.();
            onClose?.();
          }}
        >
          {confirmText}
        </Button>
      </Group>
    </Modal>
  );
}
