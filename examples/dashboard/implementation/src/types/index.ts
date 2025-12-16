// Types based on dashboard.sbp.yaml

export interface Notification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export interface DataItem {
  id: string;
  name: string;
  value: number;
  status: DataItemStatus;
  updatedAt: Date;
}

export type DataItemStatus = 'active' | 'inactive' | 'pending';

export const DataItemStatusLabels: Record<DataItemStatus, string> = {
  active: '有効',
  inactive: '無効',
  pending: '保留',
};

export type ToastType = 'success' | 'error';

export interface Toast {
  message: string;
  type: ToastType;
}

export interface DataItemForm {
  name: string;
  value: number;
  status: DataItemStatus;
}
