import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const MainLayout = () => {
  return (
    <div className="relative h-full">
      {/* Main content area with padding for bottom nav */}
      <div className="pb-[60px] h-full overflow-y-auto">
        <Outlet />
      </div>

      {/* Bottom Navigation */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
