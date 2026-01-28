import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { NotificationCard } from '@/components/NotificationCard';
import { PageHeader } from '@/components/PageHeader';
import {
  getNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from '@/services/notificationService';
import type { Notification } from '@/services/notificationService';
import { getScanResultById } from '@/services/scanResultService';
import { useAuth } from '@/context/AuthContext';

const Notifications = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications on mount
  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    loadNotifications();
  }, [isAuthenticated]);

  const loadNotifications = async () => {
    try {
      setLoading(true);
      const response = await getNotifications(1, 50); // Get 50 most recent
      setNotifications(response.data);
      setUnreadCount(response.unreadCount);
    } catch (error) {
      console.error('Failed to load notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = async (notification: Notification) => {
    try {
      // Mark as read
      if (!notification.isRead) {
        await markNotificationAsRead(notification._id);
        setNotifications((prev) =>
          prev.map((n) =>
            n._id === notification._id ? { ...n, isRead: true } : n
          )
        );
        setUnreadCount((prev) => Math.max(0, prev - 1));
      }

      // Get scan result to determine navigation
      const scanResult = await getScanResultById(notification.scanResultId);

      // Navigate to appropriate results page based on type
      if (notification.type === 'barcode_scan' && notification.barcode) {
        navigate(`/barcode-product-results`, {
          state: {
            barcode: notification.barcode,
            product: null,
            savedScanData: scanResult,
          },
        });
      } else if (notification.type === 'photo_scan') {
        // For photo scans, navigate with the scanned image to restore state
        navigate(`/product-identification-results`, {
          state: {
            scannedImage: scanResult.scannedImage,
            // Optionally pass the full scan data to avoid re-fetching
            savedScanData: scanResult,
          },
        });
      }
    } catch (error) {
      console.error('Failed to handle notification click:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead();
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  // Group notifications by date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  const todayNotifications = notifications.filter((n) => {
    const notifDate = new Date(n.createdAt);
    notifDate.setHours(0, 0, 0, 0);
    return notifDate.getTime() === today.getTime();
  });

  const yesterdayNotifications = notifications.filter((n) => {
    const notifDate = new Date(n.createdAt);
    notifDate.setHours(0, 0, 0, 0);
    return notifDate.getTime() === yesterday.getTime();
  });

  const olderNotifications = notifications.filter((n) => {
    const notifDate = new Date(n.createdAt);
    notifDate.setHours(0, 0, 0, 0);
    return notifDate.getTime() < yesterday.getTime();
  });

  return (
    <section className="bg-white h-full">
      <div className="h-full relative px-5 pt-4">
        <PageHeader title="Notifications" showNotification={false} />

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : notifications.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-gray-500 font-family-roboto">
              No notifications yet
            </p>
            <p className="text-sm text-gray-400 mt-2">
              Scan products to receive updates
            </p>
          </div>
        ) : (
          <>
            {/* Today's Notifications */}
            {todayNotifications.length > 0 && (
              <>
                <div className="border-b border-[#D9D9D9] flex justify-between font-family-roboto -mx-5 px-5">
                  <div className="border-b border-primary font-family-roboto text-primary font-bold w-fit">
                    Today
                  </div>
                  {unreadCount > 0 && (
                    <button
                      onClick={handleMarkAllAsRead}
                      className="font-medium text-primary hover:underline"
                    >
                      Mark all as read
                    </button>
                  )}
                </div>
                <section className="my-[17px] space-y-3">
                  {todayNotifications.map((notification) => (
                    <NotificationCard
                      key={notification._id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </section>
              </>
            )}

            {/* Yesterday's Notifications */}
            {yesterdayNotifications.length > 0 && (
              <>
                <div className="flex justify-between border-t border-[#D9D9D9] pt-4 -mx-5 px-5">
                  <div className="font-family-roboto text-[#686868] font-bold w-fit">
                    Yesterday
                  </div>
                </div>
                <section className="my-[17px] space-y-3">
                  {yesterdayNotifications.map((notification) => (
                    <NotificationCard
                      key={notification._id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </section>
              </>
            )}

            {/* Older Notifications */}
            {olderNotifications.length > 0 && (
              <>
                <div className="flex justify-between border-t border-[#D9D9D9] pt-4 -mx-5 px-5">
                  <div className="font-family-roboto text-[#686868] font-bold w-fit">
                    Older
                  </div>
                </div>
                <section className="my-[17px] space-y-3">
                  {olderNotifications.map((notification) => (
                    <NotificationCard
                      key={notification._id}
                      notification={notification}
                      onClick={() => handleNotificationClick(notification)}
                    />
                  ))}
                </section>
              </>
            )}
          </>
        )}
      </div>
    </section>
  );
};

export default Notifications;
