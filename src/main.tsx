import { useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import './index.css';
import App from './App.tsx';
import SignIn from './pages/SignIn.tsx';
import SignUp from './pages/SignUp.tsx';
import ResetPassword from './pages/ResetPassword.tsx';
import ResetPasswordConfirm from './pages/ResetPasswordConfirm.tsx';
import OtpVerification from './pages/OtpVerification.tsx';
import Onboarding from './pages/Onboarding.tsx';
import Profile from './pages/Profile.tsx';
import MainLayout from './layouts/MainLayout.tsx';
import EditProfile from './pages/EditProfile.tsx';
import { Search } from './pages/Search.tsx';
import Scan from './pages/Scan.tsx';
import ProductResults from './pages/ProductResults.tsx';
import VisionProductResults from './pages/VisionProductResults.tsx';
import BarcodeProductResults from './pages/BarcodeProductResults.tsx';
import ProductIdentificationResults from './pages/ProductIdentificationResults.tsx';
import { Gallery } from './pages/Gallery.tsx';
import AllCategories from './pages/AllCategories.tsx';
import Favorites from './pages/Favorites.tsx';
import FavoritesSearch from './pages/FavoritesSearch.tsx';
import { AuthProvider } from './context/AuthContext.tsx';
import { ScanCacheProvider } from './context/ScanCacheContext.tsx';
import { ProtectedRoute } from './components/ProtectedRoute.tsx';
import { PublicRoute } from './components/PublicRoute.tsx';
import FavoriteItems from './pages/FavoriteItems.tsx';
import ShoppingList from './pages/ShoppingList.tsx';
import KitchenItems from './pages/KitchenItems.tsx';
import MonthlySpecials from './pages/MonthlySpecials.tsx';
import Notifications from './pages/Notifications.tsx';
import { ZeroPlastic } from './pages/ZeroPlastic.tsx';
import TermsOfUse from './pages/TermsOfUse.tsx';
import PrivacyPolicy from './pages/PrivacyPolicy.tsx';
import OAuthCallback from './pages/OAuthCallback.tsx';
import VerifyEmail from './pages/VerifyEmail.tsx';
import { useStatusBar } from './hooks/useStatusBar.ts';
import Splash from './pages/Splash.tsx';
import { initializeGoogleAuth } from './lib/androidAuth.ts';
import { DeepLinkListener } from './components/DeepLinkListener.tsx';
// import CategoryPage from './pages/CategoryPage.tsx';
import ProductPage from './pages/ProductPage.tsx';
import ProductResultsBefore from './pages/ProductResultsBefore.tsx';

// Initialize TanStack Query client with caching config
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 60 * 24, // 24 hours - data stays fresh
      gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days - cache retention
      retry: 2, // Retry failed requests twice
      refetchOnWindowFocus: false, // Don't refetch on window focus
      refetchOnReconnect: true, // Refetch when internet reconnects
    },
  },
});

// Root component that initializes Capacitor features
function Root() {
  useStatusBar(); // Initialize status bar configuration

  // Initialize Google Auth for Android/iOS
  useEffect(() => {
    initializeGoogleAuth().catch((error) => {
      console.error('Failed to initialize Google Auth:', error);
    });
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <ScanCacheProvider>
          <BrowserRouter>
            <DeepLinkListener />
            <Routes>
              {/* OAuth Callback Route - Public (no auth check needed) */}
              <Route path="/oauth-callback" element={<OAuthCallback />} />

              {/* Public Routes WITHOUT bottom nav - redirect to home if authenticated */}

              <Route
                path="/productresbef"
                element={
                  <PublicRoute>
                    <ProductResultsBefore />
                  </PublicRoute>
                }
              />
              <Route
                path="/onboarding"
                element={
                  <PublicRoute>
                    <Onboarding />
                  </PublicRoute>
                }
              />
              <Route
                path="/signin"
                element={
                  <PublicRoute>
                    <SignIn />
                  </PublicRoute>
                }
              />
              <Route
                path="/signup"
                element={
                  <PublicRoute>
                    <SignUp />
                  </PublicRoute>
                }
              />
              <Route
                path="/verify-email"
                element={
                  <PublicRoute>
                    <VerifyEmail />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password"
                element={
                  <PublicRoute>
                    <ResetPassword />
                  </PublicRoute>
                }
              />
              <Route
                path="/reset-password/confirm"
                element={
                  <PublicRoute>
                    <ResetPasswordConfirm />
                  </PublicRoute>
                }
              />
              <Route
                path="/otp-verification"
                element={
                  <PublicRoute>
                    <OtpVerification />
                  </PublicRoute>
                }
              />

              {/* Protected Routes WITHOUT bottom nav */}
              <Route
                path="/search"
                element={
                  <ProtectedRoute>
                    <Search />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/splash"
                element={
                  <ProtectedRoute>
                    <Splash />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/scan"
                element={
                  <ProtectedRoute>
                    <Scan />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product-results"
                element={
                  <ProtectedRoute>
                    <ProductResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/vision-product-results"
                element={
                  <ProtectedRoute>
                    <VisionProductResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/barcode-product-results"
                element={
                  <ProtectedRoute>
                    <BarcodeProductResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/product-identification-results"
                element={
                  <ProtectedRoute>
                    <ProductIdentificationResults />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/gallery"
                element={
                  <ProtectedRoute>
                    <Gallery />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories"
                element={
                  <ProtectedRoute>
                    <AllCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/categories/*"
                element={
                  <ProtectedRoute>
                    <AllCategories />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/products/:productId"
                element={
                  <ProtectedRoute>
                    <ProductPage />
                  </ProtectedRoute>
                }
              />

              <Route
                path="/favorites/search"
                element={
                  <ProtectedRoute>
                    <FavoritesSearch />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/favorite-items"
                element={
                  <ProtectedRoute>
                    <FavoriteItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/shopping-list"
                element={
                  <ProtectedRoute>
                    <ShoppingList />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/kitchen-items"
                element={
                  <ProtectedRoute>
                    <KitchenItems />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/monthly-specials"
                element={
                  <ProtectedRoute>
                    <MonthlySpecials />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/notifications"
                element={
                  <ProtectedRoute>
                    <Notifications />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/zero-plastic"
                element={
                  <ProtectedRoute>
                    <ZeroPlastic />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/terms-of-use"
                element={
                  <ProtectedRoute>
                    <TermsOfUse />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/privacy-policy"
                element={
                  <ProtectedRoute>
                    <PrivacyPolicy />
                  </ProtectedRoute>
                }
              />

              {/* Protected Routes WITH bottom nav */}
              <Route
                element={
                  <ProtectedRoute>
                    <MainLayout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<App />} />
                <Route path="/profile" element={<Profile />} />
                <Route path="/edit-profile" element={<EditProfile />} />
                <Route path="/favorites" element={<Favorites />} />
              </Route>

              {/* Catch all - redirect to onboarding */}
              <Route path="*" element={<Navigate to="/onboarding" replace />} />
            </Routes>
          </BrowserRouter>
        </ScanCacheProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

createRoot(document.getElementById('root')!).render(<Root />);
