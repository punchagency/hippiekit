import { Outlet } from 'react-router-dom';
import BottomNav from '@/components/BottomNav';

const MainLayout = () => {
  return (
    <div className="relative h-full">
      {/* Main content area with padding for bottom nav and safe areas */}
      <div
        className="pb-[60px] h-full overflow-y-auto"
        style={{
          paddingBottom: 'calc(60px + env(safe-area-inset-bottom))',
        }}
      >
        <Outlet />
      </div>

      {/* Bottom Navigation - positioned above safe area */}
      <BottomNav />
    </div>
  );
};

export default MainLayout;
