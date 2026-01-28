import { Outlet } from 'react-router-dom';

/**
 * Layout for content pages without bottom navigation
 * (scan, results pages, categories, etc.)
 * Handles safe area padding
 */
const ContentLayout = () => {
  return (
    <div className="relative h-full">
      {/* Content area with safe area padding */}
      <div className="h-full overflow-y-auto pt-safe pb-safe" data-scroll-container>
        <Outlet />
      </div>
    </div>
  );
};

export default ContentLayout;
