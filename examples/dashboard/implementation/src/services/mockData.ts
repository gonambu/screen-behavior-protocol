import { Notification, DataItem } from '../types';

export const mockNotifications: Notification[] = [
  {
    id: '1',
    title: '新しいユーザーが登録されました',
    message: '山田太郎さんがアカウントを作成しました。',
    read: false,
    createdAt: new Date('2024-01-15T10:30:00'),
  },
  {
    id: '2',
    title: 'システムメンテナンス完了',
    message: '定期メンテナンスが完了しました。',
    read: false,
    createdAt: new Date('2024-01-14T08:00:00'),
  },
  {
    id: '3',
    title: '月次レポートが利用可能です',
    message: '12月の月次レポートが生成されました。',
    read: true,
    createdAt: new Date('2024-01-10T14:00:00'),
  },
];

export const mockDataItems: DataItem[] = [
  {
    id: '1',
    name: '商品A',
    value: 12500,
    status: 'active',
    updatedAt: new Date('2024-01-15T09:00:00'),
  },
  {
    id: '2',
    name: '商品B',
    value: 8900,
    status: 'active',
    updatedAt: new Date('2024-01-14T15:30:00'),
  },
  {
    id: '3',
    name: '商品C',
    value: 3200,
    status: 'pending',
    updatedAt: new Date('2024-01-13T11:00:00'),
  },
  {
    id: '4',
    name: '商品D',
    value: 15600,
    status: 'inactive',
    updatedAt: new Date('2024-01-12T16:45:00'),
  },
  {
    id: '5',
    name: '商品E',
    value: 7800,
    status: 'active',
    updatedAt: new Date('2024-01-11T10:15:00'),
  },
];

// Helper function to generate unique IDs
export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 9);
};
