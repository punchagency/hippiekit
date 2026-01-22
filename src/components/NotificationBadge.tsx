import { useEffect, useState } from 'react';
import { getUnreadCount } from '@/services/notificationService';
import { NotificationIcon } from '@/assets/icons';
import { useAuth } from '@/context/AuthContext';

interface NotificationBadgeProps {
  className?: string;
}

export const NotificationBadge = ({ className }: NotificationBadgeProps) => {
  const [unreadCount, setUnreadCount] = useState(0);
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    // Only fetch if user is authenticated
    if (!isAuthenticated) return;

    const fetchUnreadCount = async () => {
      try {
        const count = await getUnreadCount();
        setUnreadCount(count);
      } catch (error) {
        console.error('Failed to fetch unread count:', error);
      }
    };

    fetchUnreadCount();

    // Poll for updates every 30 seconds
    const interval = setInterval(fetchUnreadCount, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated]);

  return (
    <div className={`relative ${className || ''}`}>
      <NotificationIcon />
      {unreadCount > 0 && (
        <div className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[16px] h-[16px] flex items-center justify-center px-1">
          {unreadCount > 99 ? '99+' : unreadCount}
        </div>
      )}
    </div>
  );
};
