/** Lightweight pull-to-refresh for touch devices.
 * Wrap your page content with this component and pass an async onRefresh handler.
 */
import { useRef, useState, type ReactNode, type TouchEvent } from 'react';
import { Loader2 } from 'lucide-react';

type Props = {
  children: ReactNode;
  onRefresh?: () => Promise<void> | void;
  threshold?: number;
};

export const PullToRefresh = ({
  children,
  onRefresh,
  threshold = 70,
}: Props) => {
  const startYRef = useRef<number | null>(null);
  const isDraggingRef = useRef(false);
  const [pullDistance, setPullDistance] = useState(0);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleTouchStart = (e: TouchEvent<HTMLDivElement>) => {
    if (window.scrollY > 0 || isRefreshing) return;
    startYRef.current = e.touches[0].clientY;
    isDraggingRef.current = true;
  };

  const handleTouchMove = (e: TouchEvent<HTMLDivElement>) => {
    if (!isDraggingRef.current || startYRef.current === null || isRefreshing)
      return;
    const delta = e.touches[0].clientY - startYRef.current;
    if (delta > 0) {
      // Prevent native overscroll glow and capture the gesture
      e.preventDefault();
      const limited = Math.min(delta, threshold * 1.6);
      setPullDistance(limited);
    }
  };

  const resetPull = () => setPullDistance(0);

  const handleTouchEnd = async () => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;

    if (pullDistance >= threshold) {
      setIsRefreshing(true);
      try {
        await onRefresh?.();
      } finally {
        setIsRefreshing(false);
        resetPull();
      }
    } else {
      resetPull();
    }
  };

  const showSpinner = pullDistance > 20 || isRefreshing;
  const spinnerOpacity = isRefreshing
    ? 1
    : Math.min(pullDistance / threshold, 1);

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        touchAction: 'pan-y',
      }}
    >
      {/* Fixed spinner at top - no space created */}
      {showSpinner && (
        <div
          className="fixed left-1/2 -translate-x-1/2 z-50 flex items-center justify-center w-10 h-10 bg-white rounded-full shadow-lg"
          style={{
            top: `calc(${Math.max(
              pullDistance * 0.5,
              20
            )}px + var(--safe-area-inset-top))`,
            opacity: spinnerOpacity,
            transition: isRefreshing ? 'opacity 150ms ease-out' : 'none',
          }}
        >
          <Loader2
            className={`w-6 h-6 text-primary ${
              isRefreshing ? 'animate-spin' : ''
            }`}
            style={{
              transform: isRefreshing
                ? undefined
                : `rotate(${pullDistance * 2}deg)`,
            }}
          />
        </div>
      )}
      {children}
    </div>
  );
};
