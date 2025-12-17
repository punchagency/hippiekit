import { type ReactNode } from 'react';

interface SafeAreaLayoutProps {
  children: ReactNode;
  className?: string;
}

/**
 * SafeAreaLayout: A reusable wrapper component that handles safe area insets
 * for mobile devices (notches, home indicators, etc.)
 *
 * Usage:
 * <SafeAreaLayout>
 *   <YourContent />
 * </SafeAreaLayout>
 */
export const SafeAreaLayout = ({
  children,
  className = '',
}: SafeAreaLayoutProps) => {
  return (
    <div
      className={`w-full relative h-[calc(100vh_-_(env(safe-area-inset-top))_-_(env(safe-area-inset-bottom)))] flex flex-col ${className}`}
    >
      {children}
    </div>
  );
};

export default SafeAreaLayout;
