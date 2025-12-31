/** Lightweight pull-to-refresh for touch devices.
 * Wrap your page content with this component and pass an async onRefresh handler.
 */
import { useRef, useState, type ReactNode, type TouchEvent } from 'react';

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

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onTouchCancel={handleTouchEnd}
      style={{
        transform: pullDistance ? `translateY(${pullDistance}px)` : undefined,
        transition: isRefreshing
          ? 'transform 150ms ease-out'
          : 'transform 120ms ease-out',
        touchAction: 'pan-y',
      }}
    >
      <div
        style={{
          height: pullDistance > 0 || isRefreshing ? 44 : 0,
          transition: 'height 120ms ease-out',
        }}
        className="flex items-center justify-center text-sm text-gray-600"
      >
        {pullDistance > 0 || isRefreshing ? (
          <span>{isRefreshing ? 'Refreshing…' : 'Pull to refresh'}</span>
        ) : null}
      </div>
      {children}
    </div>
  );
};
