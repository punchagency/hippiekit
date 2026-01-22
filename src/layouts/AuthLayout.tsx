import { Outlet } from 'react-router-dom';

const AuthLayout = () => {
  return (
    <div className="relative h-full">
      {/* Main content area - edge-to-edge with safe area padding but no bottom nav space */}
      <div className="h-full overflow-y-auto pt-safe pb-safe">
        <Outlet />
      </div>
    </div>
  );
};

export default AuthLayout;
