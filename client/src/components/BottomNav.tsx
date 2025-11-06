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
    <nav className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-[440px] h-[60px] bg-white rounded-tl-[20px] rounded-tr-[20px] shadow-[0_-2px_10px_rgba(0,0,0,0.1)] z-30">
      <ul className="flex justify-around items-center h-full px-2">
        {navItems.map((item) => (
          <li key={item.path} className="flex-1">
            <NavLink
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center gap-1 px-2 py-2 transition-colors ${
                  isActive ? 'text-primary' : 'text-gray-500'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  <div className="w-6 h-6 flex items-center justify-center">
                    {isActive ? <item.iconFilled /> : <item.icon />}
                  </div>
                  <span className="text-[10px] sm:text-xs whitespace-nowrap">
                    {item.label}
                  </span>
                </>
              )}
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
};

export default BottomNav;
