import axios from 'axios';
import { getValidToken } from '@/lib/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export interface Notification {
  _id: string;
  userId: string;
  type: 'barcode_scan' | 'photo_scan';
  title: string;
  message: string;
  productName: string;
  productImage?: string;
  scanResultId: string;
  barcode?: string;
  isRead: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationsResponse {
  success: boolean;
  data: Notification[];
  unreadCount: number;
  pagination: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface UnreadCountResponse {
  success: boolean;
  count: number;
}

// Get all notifications
export const getNotifications = async (
  page: number = 1,
  limit: number = 20
): Promise<NotificationsResponse> => {
  const token = await getValidToken();

  const response = await axios.get(
    `${API_URL}/api/notifications?page=${page}&limit=${limit}`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data;
};

// Get unread count
export const getUnreadCount = async (): Promise<number> => {
  const token = await getValidToken();

  const response = await axios.get<UnreadCountResponse>(
    `${API_URL}/api/notifications/unread-count`,
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );

  return response.data.count;
};

// Mark notification as read
export const markNotificationAsRead = async (
  notificationId: string
): Promise<void> => {
  const token = await getValidToken();

  await axios.patch(
    `${API_URL}/api/notifications/${notificationId}/read`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Mark all notifications as read
export const markAllNotificationsAsRead = async (): Promise<void> => {
  const token = await getValidToken();

  await axios.patch(
    `${API_URL}/api/notifications/read-all`,
    {},
    {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }
  );
};

// Delete notification
export const deleteNotification = async (
  notificationId: string
): Promise<void> => {
  const token = await getValidToken();

  await axios.delete(`${API_URL}/api/notifications/${notificationId}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

// Delete all notifications
export const deleteAllNotifications = async (): Promise<void> => {
  const token = await getValidToken();

  await axios.delete(`${API_URL}/api/notifications`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};
