import notificationCardIcon from '@/assets/notificationCardIcon.svg';
import { cn } from '@/lib/utils';
import type { Notification } from '@/services/notificationService';
import { formatDistanceToNow } from 'date-fns';

interface NotificationCardProps {
  notification: Notification;
  onClick: () => void;
}

export const NotificationCard = ({
  notification,
  onClick,
}: NotificationCardProps) => {
  const timeAgo = formatDistanceToNow(new Date(notification.createdAt), {
    addSuffix: true,
  });

  return (
    <div
      onClick={onClick}
      className="rounded-[14px] px-3.5 pt-3.5 flex flex-col gap-4 font-family-roboto bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.10)] cursor-pointer hover:shadow-[0_4px_8px_0_rgba(0,0,0,0.15)] transition-shadow"
    >
      <div className="flex items-start justify-between relative">
        <div className="rounded-[10px] p-2 w-fit h-fit bg-gray-300">
          {notification.productImage ? (
            <img
              src={notification.productImage}
              alt={notification.productName}
              className="w-6 h-6 object-cover rounded"
            />
          ) : (
            <img src={notificationCardIcon} alt="Notification Icon" />
          )}
        </div>

        <div className="flex-1 pl-5">
          <span
            className={cn(
              'font-family-segoe font-bold',
              notification.isRead ? 'text-[#686868]' : 'text-primary'
            )}
          >
            {notification.title}
          </span>
          <p className="text-[11.76px] text-gray-700 mt-1">
            {notification.message}
          </p>
        </div>

        <div className="text-[#9E9E9E] text-[12px]">
          <span>{timeAgo.replace('about ', '').replace(' ago', '')}</span>
        </div>

        {!notification.isRead && (
          <div className="w-1.5 h-1.5 border-2 border-primary bg-primary rounded-full absolute right-0 -bottom-4"></div>
        )}
      </div>

      <div className="w-[26.63px] h-[2.75px] bg-[#D9D9D9] mx-auto mb-[5px] rounded-xs"></div>
    </div>
  );
};
