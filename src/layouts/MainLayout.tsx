import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const MainLayout = () => {
  return (
    <div className="relative h-full">
      {/* Main content area - edge-to-edge with safe area padding */}
      <div className="h-full overflow-y-auto pt-safe pb-safe-nav" data-scroll-container>
        <Outlet />
      </div>

      {/* Bottom Navigation - floating pill style */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
