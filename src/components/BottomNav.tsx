import {
  FavoritesIcon,
  FavoritesIconFilled,
  HomeIcon,
  HomeIconFilled,
  ProfileIcon,
  ProfileIconFilled,
  ScanIcon,
  ScanIconFilled,
} from '@/assets/bottomNavIcons';

import { NavLink } from 'react-router-dom';

// Import your nav icons here
// import { HomeIcon, SearchIcon, ProfileIcon } from '@/assets/icons';

const BottomNav = () => {
  const navItems = [
    {
      path: '/',
      label: 'Browse',
      icon: HomeIcon,
      iconFilled: HomeIconFilled,
    },
    {
      path: '/scan',
      label: 'Scan',
      icon: ScanIcon,
      iconFilled: ScanIconFilled,
    },
    {
      path: '/favorites',
      label: 'Favorites',
      icon: FavoritesIcon,
      iconFilled: FavoritesIconFilled,
    },

    {
      path: '/profile',
      label: 'Profile',
      icon: ProfileIcon,
      iconFilled: ProfileIconFilled,
    },
  ];

  return (
    <div
      className="fixed bottom-0 left-0 right-0 z-30 flex justify-center"
      style={{
        paddingBottom: 'calc(env(safe-area-inset-bottom) + 12px)',
      }}
    >
      <nav className="bg-white/95 backdrop-blur-lg rounded-full shadow-[0_4px_24px_rgba(0,0,0,0.12)] border border-gray-100/50 mx-4 px-2">
        <ul className="flex justify-around items-center h-[60px] gap-1">
          {navItems.map((item) => (
            <li key={item.path}>
              <NavLink
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 px-4 py-2 rounded-full transition-all duration-200 ${isActive
                    ? 'text-primary '
                    : 'text-gray-500 hover:bg-gray-100'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <div className="w-6 h-6 flex items-center justify-center">
                      {isActive ? <item.iconFilled /> : <item.icon />}
                    </div>
                    <span className="text-[10px] font-medium whitespace-nowrap">
                      {item.label}
                    </span>
                  </>
                )}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  );
};

export default BottomNav;
