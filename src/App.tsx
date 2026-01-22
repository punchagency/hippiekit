import { useState, useCallback } from 'react';
import {
  // takePicture,
  pickFromGallery,
} from './lib/cameraService';
// import {
//   // scanImage,
//   identifyProduct,
// } from './services/scanService';
import { barcodeService } from './services/barcodeService';
import logo from '@/assets/profileImgSample.jpg';
import logoactual from '@/assets/logoUpdate.svg';
import {
  SearchIcon,
  FilterIcon,
  OptionsIcon,
  ScanIcon,
  QRIcon,
  CameraIcon,
} from '@/assets/homeIcons';
import { NotificationBadge } from './components/NotificationBadge';
import { Categories } from './components/Categories';
import { Products } from './components/Products';
import HomeSidebar from './pages/HomeSidebar';
import { Link, useNavigate } from 'react-router-dom';
import { useTopCategories, useProducts } from '@/services/categoryService';
import { Toaster } from 'sonner';
import { toast } from '@/lib/toast.tsx';
import { stripHtml, decodeHtmlEntities } from '@/utils/textHelpers';
import { PullToRefresh } from '@/components/PullToRefresh';
import { useQueryClient } from '@tanstack/react-query';

function App() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [capturedPhoto, setCapturedPhoto] = useState<string | null>(null);
  const queryClient = useQueryClient();
  const handleRefresh = useCallback(async () => {
    // Only invalidate products on refresh, not categories
    // Categories are long-lived and don't need frequent updates
    await queryClient.invalidateQueries({
      predicate: (query) => {
        const key = Array.isArray(query.queryKey)
          ? query.queryKey[0]
          : undefined;
        return key === 'products';
      },
    });
  }, [queryClient]);
  const navigate = useNavigate();

  // Use cached queries instead of manual state management
  // Fetch only 10 top categories for home page (instead of all categories)
  const { data: categories = [], isLoading: isLoadingCategories } =
    useTopCategories(10);

  const { data: products = [], isLoading: isLoadingProducts } = useProducts(6); // Fetch 6 products

  console.log('Captured Photo URI:', capturedPhoto);

  // Transform categories for the Categories component
  const categoryProducts = categories.map((cat) => ({
    id: cat.id,
    name: decodeHtmlEntities(cat.name),
    slug: cat.slug,
    price: '', // Not applicable for categories
    image: cat.meta.featured_image || logo, // Use featured image or fallback
    items: cat.count.toString(),
    parent: cat.parent || 0,
  }));

  // Transform products for the Products component
  const productsGridData = products.map((product) => ({
    id: product.id,
    image: product._embedded?.['wp:featuredmedia']?.[0]?.source_url || logo,
    price: product.meta.cta_button_text || 'View Product',
    productName: decodeHtmlEntities(product.title.rendered),
    description: stripHtml(product.content.rendered).substring(0, 100),
    rating: 4.5, // WordPress doesn't provide ratings by default
  }));

  // Handle barcode scanning
  const handleBarcodeScan = async () => {
    try {
      // Scan barcode using ML Kit
      const scanResult = await barcodeService.scanBarcode();

      if (!scanResult.success || !scanResult.barcode) {
        toast.error(scanResult.error || 'Failed to scan barcode');
        return;
      }

      console.log('Barcode scanned:', scanResult.barcode);

      // Navigate immediately to results page - data will load there
      navigate('/barcode-product-results', {
        state: {
          product: null, // Will be loaded on results page
          barcode: scanResult.barcode,
          isBasicData: true,
        },
      });
    } catch (error) {
      console.error('Error scanning barcode:', error);
      toast.error('Failed to scan barcode. Please try again.');
    }
  };

  // Handle taking a picture with camera
  // const handleTakePicture = async () => {
  //   const photo = await takePicture();
  //   if (photo) {
  //     setCapturedPhoto(photo.webPath);
  //     await handleScanImage(photo.webPath);
  //   }
  // };

  // Handle picking from gallery - uses AI product identification
  const handleBrowsePhoto = async () => {
    try {
      const photo = await pickFromGallery();
      if (photo) {
        setCapturedPhoto(photo.webPath);

        // Navigate immediately to results page - data will load there
        navigate('/product-identification-results', {
          state: {
            scannedImage: photo.webPath,
          },
        });
      }
    } catch (error) {
      console.error('Error browsing photo:', error);
      if (error instanceof Error) {
        toast.error(error.message);
      } else {
        toast.error('Failed to select photo. Please try again.');
      }
    }
  };

  // // Handle product identification with AI + Web search
  // const handleIdentifyProduct = async (imageUri: string) => {
  //   try {
  //     const result = await identifyProduct(imageUri);

  //     console.log('Product identification result:', result);

  //     // Update the already-navigated page with results (or navigate if not already there)
  //     // The results page will handle this via location state
  //     navigate('/product-identification-results', {
  //       state: {
  //         result: result,
  //         scannedImage: imageUri,
  //         isLoading: false,
  //       },
  //       replace: true, // Replace current history entry
  //     });
  //   } catch (error) {
  //     console.error('Error identifying product:', error);
  //     // Navigate with error state
  //     navigate('/product-identification-results', {
  //       state: {
  //         result: null,
  //         scannedImage: imageUri,
  //         isLoading: false,
  //         error:
  //           error instanceof Error
  //             ? error.message
  //             : 'Failed to identify product. Please try again.',
  //       },
  //       replace: true,
  //     });
  //   }
  // };

  // // Handle scanning the image
  // const handleScanImage = async (imageUri: string) => {
  //   try {
  //     setIsScanning(true);
  //     const result = await scanImage(imageUri);

  //     console.log('Scan result:', result);

  //     if (result.success && result.products.length > 0) {
  //       // Navigate to product results with scan results
  //       navigate('/product-results', {
  //         state: {
  //           scanResults: result.products,
  //           scannedImage: imageUri,
  //         },
  //       });
  //     } else {
  //       // Show no results message
  //       alert(
  //         result.message || 'No matching products found. Try a different image.'
  //       );
  //     }
  //   } catch (error) {
  //     console.error('Error scanning image:', error);
  //     alert(
  //       'Failed to scan image. Please make sure the AI service is running.'
  //     );
  //   } finally {
  //     setIsScanning(false);
  //   }
  // };

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <>
        <Toaster position="top-center" />
        <div className="relative min-h-full overflow-hidden">
          <HomeSidebar open={isSidebarOpen} onOpenChange={setIsSidebarOpen} />

          {/* Fixed Header */}
          <header className="fixed top-[env(safe-area-inset-top)] left-0 right-0 max-w-[440px] mx-auto px-4 sm:px-5 pt-4 sm:pt-6 pb-3 sm:pb-4 bg-[#f5f5f5] z-40">
            <div className="flex items-center justify-between mb-3 sm:mb-4">
              <button
                onClick={() => setIsSidebarOpen(true)}
                className="rounded-[7px] p-2 sm:p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
              >
                <OptionsIcon />
              </button>

              <div className=" flex p-2 sm:p-2.5 items-center gap-[7px] rounded-[85px] border border-secondary">
                <img
                  src={logoactual}
                  alt="Logo"
                  className="w-6 h-6 sm:w-8 sm:h-8 rounded-full"
                />
                <span className="font-family-segoe text-primary text-[14px] sm:text-[18px] font-bold">
                  Hippiekit
                </span>
              </div>

              <button className="rounded-[7px] p-2 sm:p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
                <Link
                  to="/notifications"
                  className="cursor-pointer w-full h-full"
                >
                  <NotificationBadge />
                </Link>
              </button>
            </div>

            {/* Search Bar */}
            <div className="relative mb-3 sm:mb-4">
              <div className="flex items-center gap-2">
                <div className="flex-1 relative">
                  <input
                    type="text"
                    placeholder="Search Here For Specific Item"
                    // value={searchQuery}
                    // onChange={(e) => setSearchQuery(e.target.value)}
                    onClick={() => navigate('/search')}
                    className="w-full pl-9 sm:pl-10 pr-3 sm:pr-4 py-2.5 sm:py-3 text-sm sm:text-base rounded-lg border border-gray-200 focus:outline-none focus:border-primary bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
                  />
                  <div className="absolute left-3 top-1/2 -translate-y-1/2">
                    <SearchIcon />
                  </div>
                </div>
                <button
                  onClick={() => navigate('/search')}
                  className="p-2.5 sm:p-3 bg-white rounded-lg border border-gray-200"
                >
                  <FilterIcon />
                </button>
              </div>
            </div>

            {/* Scan Button */}
            <div className="rounded-[7px] px-3 sm:px-4 py-4 sm:py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex flex-col gap-3 sm:gap-7.5 items-center justify-center">
              <div className="flex flex-col gap-2 sm:gap-5 items-center justify-center">
                <div className="bg-[#F5F5F5] rounded-[10px] flex w-[48px] h-[48px] sm:w-[64.198px] sm:h-[60px] p-2 sm:p-2.5 flex-col justify-center items-center gap-2.5">
                  <ScanIcon />
                </div>
                <span className="font-family-segoe text-primary text-[16px] sm:text-[20px] font-bold capitalize text-center px-2">
                  Scan Code or upload photo
                </span>
              </div>
              <div className="flex flex-row gap-1.5 sm:gap-2.5 w-full font-family-poppins font-semibold text-xs sm:text-base">
                <button
                  onClick={handleBarcodeScan}
                  className="flex flex-1 px-1.5 py-2 sm:p-2 justify-center items-center gap-1 sm:gap-4 rounded-md bg-primary min-w-0"
                >
                  <QRIcon className="shrink-0" />
                  <span className="text-white truncate">Scan Barcode</span>
                </button>
                <button
                  onClick={handleBrowsePhoto}
                  className="flex flex-1 px-1.5 py-2 sm:p-2 justify-center items-center gap-1 sm:gap-4 border border-primary rounded-md bg-transparency min-w-0"
                >
                  <CameraIcon className="shrink-0" />
                  <span className="text-primary font-medium truncate">
                    Browse Photo
                  </span>
                </button>
              </div>
            </div>
          </header>

          {/* Scrollable Content - Add padding-top to account for fixed header */}
          <div className="pt-[300px]">
            {/* Top Categories */}
            <section className="max-[320px]:mx-2 mx-4 rounded-[7px] px-2 sm:px-4 py-3 sm:py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex flex-col gap-3 sm:gap-7.5">
              <div className="flex justify-between items-center gap-2">
                <h2 className="text-primary font-family-segoe text-[14px] sm:text-[18px] font-bold capitalize">
                  Top Categories
                </h2>

                <button
                  className="text-[#848484] underline text-xs sm:text-base shrink-0"
                  onClick={() => navigate('/categories')}
                >
                  <Link to="/categories">See all</Link>
                </button>
              </div>
              {isLoadingCategories ? (
                <div className="flex gap-5 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
                  {[...Array(4)].map((_, index) => (
                    <div
                      key={index}
                      className="flex flex-col items-center gap-1 sm:gap-1.5 md:gap-2 shrink-0 w-20 sm:w-24"
                    >
                      <div className="w-full aspect-square rounded-[10px] bg-primary/10 animate-pulse" />
                      <div className="h-3 sm:h-4 w-full bg-primary/10 rounded animate-pulse" />
                      <div className="h-2 sm:h-3 w-3/4 bg-primary/10 rounded animate-pulse" />
                    </div>
                  ))}
                </div>
              ) : categoryProducts.length > 0 ? (
                <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
                  <Categories
                    topCat
                    products={categoryProducts}
                    selection="link"
                  />
                </div>
              ) : (
                <div className="flex justify-center items-center py-8">
                  <p className="text-gray-500 text-sm">
                    No categories available
                  </p>
                </div>
              )}
            </section>

            {/* Products Grid */}
            <section className="max-[320px]:mx-2 mx-4 mt-3 mb-4 rounded-[7px] px-2 sm:px-4 py-3 sm:py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex flex-col gap-3 sm:gap-7.5">
              <h2 className="text-primary font-family-segoe text-[14px] sm:text-[18px] font-bold capitalize">
                New Product Corner
              </h2>

              {isLoadingProducts ? (
                <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
                  {[...Array(3)].map((_, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2 sm:p-2.5 flex flex-col gap-2 sm:gap-2.5 shrink-0 w-36 sm:w-[180px]"
                    >
                      <div className="w-full h-[100px] sm:h-[127px] rounded-lg bg-primary/10 animate-pulse" />
                      <div className="flex flex-col gap-2 sm:gap-3.5">
                        <div className="flex flex-col gap-1 sm:gap-2.5">
                          <div className="h-3 sm:h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
                          <div className="h-2 sm:h-3 w-full bg-primary/10 rounded animate-pulse" />
                        </div>
                        <div className="h-5 sm:h-6 w-10 sm:w-12 bg-primary/10 rounded-[5px] animate-pulse" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : productsGridData.length > 0 ? (
                <Products
                  data={productsGridData}
                  horizontal
                  onProductClick={(productId) =>
                    navigate(`/products/${productId}`)
                  }
                />
              ) : (
                <div className="flex justify-center items-center py-8">
                  <p className="text-gray-500">No products available</p>
                </div>
              )}
            </section>
          </div>
        </div>
      </>
    </PullToRefresh>
  );
}

export default App;
