import type { ReactNode } from "react";

export type ModalProps = {
  open?: boolean;
  title?: string;
  message?: ReactNode | string;
  confirmText?: string;
  cancelText?: string;
  onConfirm?: () => void;
  onClose?: () => void;
  onSuccess?: () => void;
  onSaved?: () => void;
  danger?: boolean;
  success?: string;
  errorDefault?: string;
};

export type OpenArgs = {
  id?: string;
  url?: string;
  title?: string;
};

export type VideoState = {
  id: string;
  title?: string;
  url?: string;
} | null;

export type Ctx = {
  open: (args: OpenArgs) => void;
};

export type TableColumn<T> = {
  key: string;
  header: string;
  className?: string;
  render?: (row: T) => ReactNode;
  accessor?: (row: T) => ReactNode | string | number | null | undefined;
  sortable?: boolean;
  sortKey?: string;
};

export type TableProps<T> = {
  endpoint: string;
  columns: TableColumn<T>[];
  baseParams?: Record<string, any>;
  initialSearch?: string;
  initialPerPage?: number;
  queryKey?: any[];
  emptyText?: string;
  actionsColHeader?: string;
  actions?: (row: T) => ReactNode;
  toolbarRight?: ReactNode;
  title?: string;
};

export type TableOptions = {
  baseParams?: Record<string, any>;
  initialSearch?: string;
  initialPerPage?: number;
  queryKey?: any[];
  searchParam?: "search" | "q";
};
