import { EditIcon } from '@/assets/icons';
import profileImgSample from '@/assets/profileImgSample.jpg';
import { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import {
  ChevronRight,
  Bell,
  Globe,
  Shield,
  FileText,
  LogOut,
  Settings,
  Sparkles,
  User,
} from 'lucide-react';

const Profile = () => {
  const [notifications, setNotifications] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const menuItems = [
    {
      icon: Bell,
      label: 'Notifications',
      description: 'Manage your alerts',
      action: () => setNotifications(!notifications),
      toggle: true,
      toggleValue: notifications,
    },
    {
      icon: Globe,
      label: 'Preferences',
      description: 'Product origin & filters',
      action: () => { },
      chevron: true,
    },
    {
      icon: Shield,
      label: 'Privacy Policy',
      description: 'How we protect your data',
      action: () => navigate('/privacy-policy'),
      chevron: true,
    },
    {
      icon: FileText,
      label: 'Terms of Use',
      description: 'Our terms and conditions',
      action: () => navigate('/terms-of-use'),
      chevron: true,
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="px-5 pt-6 pb-4">
        <div className="flex items-center justify-center gap-2">
          <User className="w-5 h-5 text-primary" />
          <h1 className="text-xl font-semibold text-gray-900 font-family-segoe">Profile</h1>
        </div>
      </div>

      {/* Profile Card */}
      <div className="mx-4 bg-white rounded-2xl shadow-sm p-5">
        <div className="flex items-center gap-4">
          {/* Avatar */}
          <div className="relative">
            <div className="w-[72px] h-[72px] rounded-full overflow-hidden border-[3px] border-primary/20">
              <img
                src={
                  imgError || !user?.profileImage
                    ? profileImgSample
                    : user.profileImage
                }
                alt="Profile"
                className="w-full h-full object-cover"
                onError={() => setImgError(true)}
                referrerPolicy="no-referrer"
                crossOrigin="anonymous"
              />
            </div>
            <Link
              to="/edit-profile"
              className="absolute -bottom-0.5 -right-0.5 w-6 h-6 bg-primary rounded-full flex items-center justify-center shadow-md"
            >
              <EditIcon />
            </Link>
          </div>

          {/* User Info */}
          <div className="flex-1 min-w-0">
            <h2 className="text-lg font-bold text-gray-900 truncate font-family-segoe">
              {user?.name || 'User Name'}
            </h2>
            <p className="text-sm text-gray-500 truncate">
              {user?.email || 'email@example.com'}
            </p>
            {user?.phoneNumber && (
              <p className="text-xs text-gray-400 mt-0.5">{user.phoneNumber}</p>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 mt-4 space-y-4">
        {/* Premium Card */}
        <div className="bg-primary rounded-2xl p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center">
              <Sparkles className="w-6 h-6 text-white" />
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold font-family-segoe">Go Premium</h3>
              <p className="text-white/70 text-sm">Unlock all features</p>
            </div>
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="text-white text-xs font-medium">Soon</span>
            </div>
          </div>
        </div>

        {/* Settings Section */}
        <div className="bg-white rounded-2xl overflow-hidden">
          <div className="px-4 py-3 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <Settings className="w-4 h-4 text-gray-400" />
              <span className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                Settings
              </span>
            </div>
          </div>

          {menuItems.map((item, index) => (
            <button
              key={index}
              onClick={item.action}
              className="w-full flex items-center gap-3 px-4 py-3.5 active:bg-gray-50 transition-colors border-b border-gray-50 last:border-0"
            >
              <div className="w-9 h-9 rounded-xl bg-primary/8 flex items-center justify-center">
                <item.icon className="w-[18px] h-[18px] text-primary" />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-gray-900 text-[15px] font-family-segoe">
                  {item.label}
                </p>
                <p className="text-xs text-gray-400">{item.description}</p>
              </div>
              {item.toggle && (
                <div
                  className={`w-11 h-[26px] rounded-full transition-colors duration-200 ${item.toggleValue ? 'bg-primary' : 'bg-gray-200'
                    }`}
                >
                  <div
                    className={`w-[22px] h-[22px] bg-white rounded-full shadow-sm transform transition-transform duration-200 mt-[2px] ${item.toggleValue ? 'translate-x-[22px]' : 'translate-x-[2px]'
                      }`}
                  />
                </div>
              )}
              {item.chevron && (
                <ChevronRight className="w-5 h-5 text-gray-300" />
              )}
            </button>
          ))}
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 py-3.5 rounded-2xl bg-red-50 active:bg-red-100 transition-colors"
        >
          <LogOut className="w-[18px] h-[18px] text-red-500" />
          <span className="font-semibold text-red-500 text-[15px]">
            Log Out
          </span>
        </button>

        {/* Footer */}
        <div className="text-center pb-2 pt-1">
          <p className="text-xs text-gray-400">
            Hippiekit v1.0 &middot; Made with care
          </p>
        </div>
      </div>
    </div>
  );
};

export default Profile;
