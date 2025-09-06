import { useCallback, useRef, useState } from "react";
import { ConfirmModal } from "@/components/modals";
import type { ModalProps } from "@/types";

export function useConfirm() {
  const [open, setOpen] = useState(false);
  const [opts, setOpts] = useState<ModalProps>({ title: "" });
  const resolver = useRef<((v: boolean) => void) | null>(null);

  const confirm = useCallback((o: ModalProps) => {
    setOpts(o);
    setOpen(true);
    return new Promise<boolean>((resolve) => {
      resolver.current = resolve;
    });
  }, []);

  const handleClose = () => {
    setOpen(false);
    if (resolver.current) resolver.current(false);
    resolver.current = null;
  };

  const handleConfirm = () => {
    setOpen(false);
    if (resolver.current) resolver.current(true);
    resolver.current = null;
  };

  const ConfirmUI = (
    <ConfirmModal
      open={open}
      title={opts.title}
      message={opts.message}
      confirmText={opts.confirmText ?? "Confirmar"}
      cancelText={opts.cancelText ?? "Cancelar"}
      danger={opts.danger}
      onConfirm={handleConfirm}
      onClose={handleClose}
    />
  );

  return { confirm, ConfirmUI };
}
