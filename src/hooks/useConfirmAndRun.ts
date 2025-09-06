import { notifications } from "@mantine/notifications";
import { useConfirm } from "@/hooks/useConfirm";
import type { ModalProps } from "@/types";

export function useConfirmAndRun() {
  const { confirm, ConfirmUI } = useConfirm();

  async function confirmAndRun<T>(
    opts: ModalProps,
    run: () => Promise<T>,
    handlers?: ModalProps,
  ): Promise<boolean> {
    const ok = await confirm({
      title: opts.title,
      message: opts.message,
      confirmText: opts.confirmText,
      cancelText: opts.cancelText,
      danger: opts.danger,
    });
    if (!ok) return false;

    try {
      await run();
      if (opts.success)
        notifications.show({ message: opts.success, color: "teal" });
      handlers?.onSuccess?.();
      return true;
    } catch (e: any) {
      const msg =
        e?.response?.data?.message ?? opts.errorDefault ?? "Falha na operação.";
      notifications.show({ message: msg, color: "red" });
      return false;
    }
  }

  return { confirmAndRun, ConfirmUI };
}
