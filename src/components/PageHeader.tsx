/**
 * Consistent page header with optional back button and notification action.
 */
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import backButton from '@/assets/backButton.svg';
import { NotificationIcon } from '@/assets/icons';

interface PageHeaderProps {
  title: string;
  /** Show a back button; defaults to true */
  showBack?: boolean;
  /** Custom back handler; defaults to navigate(-1) */
  onBack?: () => void;
  /** Show notifications button on the right */
  showNotification?: boolean;
  /** Optional custom right-side content (overrides notification button) */
  rightSlot?: ReactNode;
  /** Optional leading icon beside the title (e.g., favorites heart) */
  titleIconSrc?: string;
  className?: string;
}

export const PageHeader = ({
  title,
  showBack = true,
  onBack,
  showNotification = false,
  rightSlot,
  titleIconSrc,
  className,
}: PageHeaderProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) return onBack();
    navigate(-1);
  };

  const handleNotifications = () => navigate('/notifications');

  const renderSpacer = () => <div className="w-10" aria-hidden />;

  return (
    <div
      className={cn('flex items-center justify-between gap-3 mb-4', className)}
    >
      {showBack ? (
        <button
          onClick={handleBack}
          className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
          aria-label="Go back"
        >
          <img src={backButton} alt="Back" />
        </button>
      ) : (
        renderSpacer()
      )}

      <div className="flex items-center gap-2 mx-auto">
        {titleIconSrc ? (
          <img src={titleIconSrc} alt="" className="w-5 h-5" />
        ) : null}
        <span className="font-family-segoe text-primary text-[18px] font-bold text-center">
          {title}
        </span>
      </div>

      {rightSlot ? (
        rightSlot
      ) : showNotification ? (
        <button
          onClick={handleNotifications}
          className="rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
          aria-label="Notifications"
        >
          <NotificationIcon />
        </button>
      ) : (
        renderSpacer()
      )}
    </div>
  );
};
