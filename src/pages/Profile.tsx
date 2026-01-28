import {
  CrownIcon,
  EditIcon,
  NotificationIcon,
  PreferenceIcon,
  UserIcon,
} from '@/assets/icons';
import profileImgSample from '@/assets/profileImgSample.jpg';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Toggle } from '@/components/ui/toggle';
import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import { preferencesStore } from '@/lib/preferencesStore';
import type { UserPreferences } from '@/lib/preferencesStore';

const Profile = () => {
  const [notifications, setNotifications] = useState(false);
  const [countryPreferences, setCountryPreferences] = useState<
    UserPreferences['countryPreferences']
  >({
    usa: false,
    canada: false,
    mexico: false,
    europe: false,
  });
  const [imgError, setImgError] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  // Load preferences from storage on mount
  useEffect(() => {
    const loadPreferences = async () => {
      try {
        const prefs = await preferencesStore.getPreferences();
        setNotifications(prefs.notifications);
        setCountryPreferences(prefs.countryPreferences);
      } catch (error) {
        console.error('Error loading preferences:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadPreferences();
  }, []);

  // Handle notifications toggle change
  const handleNotificationsChange = async (enabled: boolean) => {
    setNotifications(enabled);
    try {
      await preferencesStore.setNotifications(enabled);
    } catch (error) {
      console.error('Error saving notifications preference:', error);
      // Revert on error
      setNotifications(!enabled);
    }
  };

  // Handle country preference change
  const handleCountryPreferenceChange = async (
    country: keyof UserPreferences['countryPreferences'],
    enabled: boolean
  ) => {
    setCountryPreferences((prev) => ({ ...prev, [country]: enabled }));
    try {
      await preferencesStore.setCountryPreference(country, enabled);
    } catch (error) {
      console.error('Error saving country preference:', error);
      // Revert on error
      setCountryPreferences((prev) => ({ ...prev, [country]: !enabled }));
    }
  };

  console.log('users phone number', user);
  return (
    <section className="bg-white font-family-roboto pb-20">
      <div className="relative font-family-roboto pb-20">
        <div className="h-[140px] sm:h-[165px] bg-primary flex justify-center gap-2 sm:gap-2.5 pt-8 sm:pt-[49px]">
          <UserIcon
            fill="white"
            height="18"
            width="16"
            className="sm:h-[22px] sm:w-[19.097px]"
          />
          <p className="font-family-segoe text-white text-[18px] sm:text-[20px]">
            User Profile
          </p>
        </div>
        <div className="w-20 h-20 sm:w-[100px] sm:h-[100px] rounded-[63px] border-4 sm:border-[6px] border-[#FFF] object-cover mx-auto -mt-10 sm:mt-[-50px] overflow-hidden">
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

        <p className="font-family-segoe text-center text-primary text-[16px] sm:text-[18px] font-extrabold mt-2">
          {user?.name || 'User Name'}
        </p>
        <p className="text-center text-[14px] sm:text-[16px]">
          {user?.email || 'Email'}
        </p>
        {user?.phoneNumber && (
          <p className="text-center text-[12px] sm:text-[14px] text-gray-600">
            {user.phoneNumber}
          </p>
        )}

        <div className="flex items-center justify-center gap-2 mt-2 px-4">
          <Button
            asChild
            className="bg-transparent w-full max-w-[107px] text-sm sm:text-base border border-primary text-primary"
          >
            <Link to="/edit-profile">
              <EditIcon /> Edit Profile
            </Link>
          </Button>
        </div>

        <div className="mt-6 sm:mt-[30px] rounded-xl bg-white mx-4 sm:mx-[21.7px] flex flex-col gap-3 sm:gap-4 p-3 sm:p-3.5 shadow-[0_2px_6px_0_rgba(0,0,0,0.12)]">
          <div className="flex items-center gap-2 sm:gap-3">
            <NotificationIcon />
            <div className="flex flex-col gap-1.5 sm:gap-2.5 text-[14px] sm:text-[16px]">
              <p className="text-primary font-family-segoe font-bold">
                Notifications
              </p>
              <p className="text-[10px] sm:text-[11.765px]">
                Get alerts when new clean products are added
              </p>
            </div>
          </div>
          <div className="flex justify-between items-center">
            <p className="text-[10px] sm:text-[11.765px]">New products here</p>
            <Toggle
              checked={notifications}
              onChange={handleNotificationsChange}
              disabled={isLoading}
            />
          </div>
        </div>

        <div className="mt-6 sm:mt-[30px] rounded-xl bg-white mx-4 sm:mx-[21.7px] flex gap-2 sm:gap-3 p-3 sm:p-3.5 shadow-[0_2px_6px_0_rgba(0,0,0,0.12)]">
          <PreferenceIcon />
          <div className="flex flex-col gap-3 sm:gap-4 flex-1">
            <p className="font-family-segoe text-[14px] sm:text-[16px] font-bold text-primary">
              Preferences
            </p>
            <ul className="flex flex-col gap-2">
              <li className="flex justify-between items-center w-full text-sm sm:text-base">
                <p>Made in USA</p>
                <Checkbox
                  checked={countryPreferences.usa}
                  onCheckedChange={(checked) =>
                    handleCountryPreferenceChange('usa', checked === true)
                  }
                  disabled={isLoading}
                />
              </li>
              <li className="flex justify-between items-center w-full text-sm sm:text-base">
                <p>Canada</p>
                <Checkbox
                  checked={countryPreferences.canada}
                  onCheckedChange={(checked) =>
                    handleCountryPreferenceChange('canada', checked === true)
                  }
                  disabled={isLoading}
                />
              </li>
              <li className="flex justify-between items-center w-full text-sm sm:text-base">
                <p>Mexico</p>
                <Checkbox
                  checked={countryPreferences.mexico}
                  onCheckedChange={(checked) =>
                    handleCountryPreferenceChange('mexico', checked === true)
                  }
                  disabled={isLoading}
                />
              </li>
              <li className="flex justify-between items-center w-full text-sm sm:text-base">
                <p>Europe</p>
                <Checkbox
                  checked={countryPreferences.europe}
                  onCheckedChange={(checked) =>
                    handleCountryPreferenceChange('europe', checked === true)
                  }
                  disabled={isLoading}
                />
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-6 sm:mt-[30px] py-4 sm:py-5 px-3 sm:px-3.5 mx-4 sm:mx-[21.7px] rounded-xl bg-[#FFB743] flex gap-6 sm:gap-[30px] flex-col justify-center items-center text-center">
          <CrownIcon />
          <div className="text-[#FFFFFF] flex flex-col gap-4 sm:gap-6">
            <p className="text-[18px] sm:text-[20px] font-bold font-family-segoe">
              Go Premium
            </p>
            <p className="text-[14px] sm:text-[16px] font-medium">
              Coming soon in Phase 2
            </p>
          </div>
        </div>

        {/* Legal Links */}
        <div className="mt-6 mx-4 sm:mx-[21.7px] pb-4 flex flex-col gap-3 items-center">
          <div className="flex gap-4 text-sm text-gray-600">
            <button
              onClick={() => navigate('/terms-of-use')}
              className="hover:text-primary underline transition-colors"
            >
              Terms of Use
            </button>
            <span className="text-gray-400">|</span>
            <button
              onClick={() => navigate('/privacy-policy')}
              className="hover:text-primary underline transition-colors"
            >
              Privacy Policy
            </button>
          </div>
          <p className="text-xs text-gray-500">
            © 2025 Hippiekit. All rights reserved.
          </p>
        </div>
      </div>
    </section>
  );
};

export default Profile;
