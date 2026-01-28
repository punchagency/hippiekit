/**
 * Consistent page header with optional back button and notification action.
 */
import type { ReactNode } from 'react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import backButton from '@/assets/backButton.svg';
import { NotificationBadge } from './NotificationBadge';

interface PageHeaderProps {
  title: string;
  showBack?: boolean;
  onBack?: () => void;
  showNotification?: boolean;
  rightSlot?: ReactNode;
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
    // If a custom onBack is provided, use it
    if (onBack) return onBack();

    // Override back for specific routes
    if (
      location.pathname.includes('product-identification-results') ||
      location.pathname.includes('barcode-product-results')
    ) {
      navigate('/'); // Go to home screen
    } else {
      navigate(-1); // Go back in history
    }
  };

  const handleNotifications = () => navigate('/notifications');

  const isLongTitle = title.length > 20;

  return (
    <div className={cn('flex items-center gap-3 mb-4', className)}>
      {showBack ? (
        <button
          onClick={handleBack}
          className="shrink-0 rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
          aria-label="Go back"
        >
          <img src={backButton} alt="Back" />
        </button>
      ) : (
        <div className="shrink-0 w-10" aria-hidden />
      )}

      {/* TITLE */}
      <div
        className={cn(
          'flex items-center gap-2 flex-1 min-w-0 overflow-hidden',
          !isLongTitle && 'justify-center'
        )}
      >
        {titleIconSrc ? (
          <img src={titleIconSrc} alt="" className="shrink-0 w-5 h-5" />
        ) : null}

        {isLongTitle ? (
          <div className="overflow-hidden whitespace-nowrap flex-1 min-w-0">
            <div className="flex w-max animate-marquee">
              <span className="font-family-segoe text-primary text-[18px] font-bold mr-8">
                {title}
              </span>
              <span
                aria-hidden
                className="font-family-segoe text-primary text-[18px] font-bold mr-8"
              >
                {title}
              </span>
            </div>
          </div>
        ) : (
          <span className="font-family-segoe text-primary text-[18px] font-bold text-center">
            {title}
          </span>
        )}
      </div>

      {rightSlot ? (
        rightSlot
      ) : showNotification ? (
        <button
          onClick={handleNotifications}
          className="shrink-0 rounded-[7px] p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
          aria-label="Notifications"
        >
          <NotificationBadge />
        </button>
      ) : (
        <div className="shrink-0 w-10" aria-hidden />
      )}
    </div>
  );
};
