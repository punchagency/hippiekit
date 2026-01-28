import { Outlet } from 'react-router-dom';

/**
 * Layout for authentication pages (signin, signup, onboarding, etc.)
 * Handles safe area padding without bottom navigation
 */
const AuthLayout = () => {
  return (
    <div className="relative h-full">
      {/* Content area with safe area padding */}
      <div className="h-full overflow-y-auto pt-safe pb-safe" data-scroll-container>
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
