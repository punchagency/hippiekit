import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

import profileImgSample from '@/assets/profileImgSample.jpg';
import newProductsIcon from '@/assets/newProducts.svg';
import notifications from '@/assets/notificationsIcon.svg';
import shoppingListIcon from '@/assets/shoppingList.svg';
import iconDescriptionIcon from '@/assets/iconDescIcon.svg';
import helpCenterIcon from '@/assets/helpCenter.svg';
import favoritesIcon from '@/assets/favoritesIcon.svg';
import logoutImage from '@/assets/logoutImage.svg';
import { useAuth } from '@/context/AuthContext';

interface HomeSidebarProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const HomeSidebar = ({ open, onOpenChange }: HomeSidebarProps) => {
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const { user, logout } = useAuth();

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (open) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    // Cleanup on unmount
    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [open]);

  const menuItems = [
    { icon: newProductsIcon, label: 'New Products', path: '/monthly-specials' },
    { icon: favoritesIcon, label: 'Favorites', path: '/favorites' },
    {
      icon: notifications,
      label: 'Notifications',
      path: '/notifications',
    },
    { icon: shoppingListIcon, label: 'Shopping List', path: '/shopping-list' },
    {
      icon: iconDescriptionIcon,
      label: 'Icon Description',
      path: '/icon-description',
    },
    { icon: helpCenterIcon, label: 'Help Center', path: '/help' },
  ];

  const handleLogout = () => {
    setShowLogoutModal(true);
  };

  const confirmLogout = () => {
    // TODO: Implement actual logout functionality
    logout();
    console.log('User logged out');
    setShowLogoutModal(false);
    onOpenChange(false);
  };

  const cancelLogout = () => {
    setShowLogoutModal(false);
  };

  const [imgError, setImgError] = useState(false);
  return (
    <>
      {/* Backdrop Overlay */}
      {open && (
        <div
          className="absolute inset-0 bg-black/50 z-40 transition-opacity"
          onClick={() => onOpenChange(false)}
          style={{ height: '100vh' }}
        />
      )}

      {/* Sidebar */}
      <div
        className={`absolute top-0 left-0 h-full max-w-[80%] bg-white z-50 transform transition-transform duration-300 ease-in-out ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ height: '100vh' }}
      >
        {/* Purple Header Section */}
        <div className="bg-primary p-5 sm:p-6 pb-6 sm:pb-8">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2.5 sm:gap-3">
              {/* Avatar */}
              <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-full bg-white/20 flex items-center justify-center text-white font-semibold text-sm sm:text-base overflow-hidden">
                <img
                  src={
                    imgError || !user?.profileImage
                      ? profileImgSample
                      : user.profileImage
                  }
                  alt="Profile"
                  className="w-full h-full object-cover rounded-full"
                  onError={() => setImgError(true)}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                />
              </div>

              {/* User Info */}
              <div className="text-white text-left">
                <h3 className="font-semibold text-sm sm:text-base">
                  {user?.name}
                </h3>
                <p className="text-[11px] sm:text-xs opacity-90 line-clamp-3 ">
                  {user?.email}
                </p>
              </div>
            </div>

            {/* Close Button */}
            <button
              onClick={() => onOpenChange(false)}
              className="text-white opacity-70 hover:opacity-100"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="sm:w-5 sm:h-5"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
        </div>

        {/* Menu Items Section */}
        <div className="bg-white py-3 sm:py-4 overflow-y-auto h-[calc(100vh-160px)]">
          {menuItems.map((item, index) => (
            <Link
              key={index}
              to={item.path}
              onClick={() => onOpenChange(false)}
              className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-2.5 sm:py-3 hover:bg-purple-50 transition-colors"
            >
              <div className="rounded-[10px] p-1.5 sm:p-2 w-fit h-fit bg-[#F5F5F5]">
                <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                  <img
                    src={item.icon}
                    alt=""
                    className="w-full h-full object-contain"
                  />
                </div>
              </div>
              <span className="text-gray-800 font-medium text-[13px] sm:text-sm">
                {item.label}
              </span>
            </Link>
          ))}

          {/* Logout Button */}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 sm:gap-4 px-5 sm:px-6 py-2.5 sm:py-3 w-full hover:bg-purple-50 transition-colors text-left"
          >
            <div className="rounded-[10px] p-1.5 sm:p-2 w-fit h-fit bg-[#F5F5F5]">
              <div className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#650084"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="sm:w-5 sm:h-5"
                >
                  <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                  <polyline points="16 17 21 12 16 7"></polyline>
                  <line x1="21" y1="12" x2="9" y2="12"></line>
                </svg>
              </div>
            </div>
            <span className="text-gray-800 font-medium text-[13px] sm:text-sm">
              Logout
            </span>
          </button>
        </div>
      </div>

      {/* Logout Confirmation Modal */}
      {showLogoutModal && (
        <>
          {/* Modal Backdrop */}
          <div className="fixed inset-0 bg-black/50 z-60 flex items-center justify-center p-4">
            <div className="bg-white rounded-[20px] w-full max-w-[340px] p-6 sm:p-8 shadow-lg">
              {/* Illustration */}
              <div className="flex justify-center mb-5 sm:mb-6">
                <img
                  src={logoutImage}
                  alt="Logout illustration"
                  className="w-40 h-40 sm:w-[200px] sm:h-[200px]"
                />
              </div>

              {/* Title */}
              <h2 className="text-center text-[#1a1a1a] text-[20px] sm:text-[24px] font-bold mb-2 sm:mb-3">
                Log Out
              </h2>

              {/* Message */}
              <p className="text-center text-gray-600 text-[13px] sm:text-[14px] mb-5 sm:mb-6">
                Are You Sure You Want To Log Out?
              </p>

              {/* Buttons */}
              <div className="flex gap-2.5 sm:gap-3">
                <button
                  onClick={cancelLogout}
                  className="flex-1 bg-[#FF3B30] text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-[10px] hover:bg-[#e6352b] transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={confirmLogout}
                  className="flex-1 bg-[#34C759] text-white font-semibold py-2.5 sm:py-3 text-sm sm:text-base rounded-[10px] hover:bg-[#2fb34d] transition-colors"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default HomeSidebar;
