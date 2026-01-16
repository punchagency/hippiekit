import { Products } from '@/components/Products';
import { useInfiniteProductsByCategory } from '@/services/categoryService';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import profileSampleImage from '@/assets/profileImgSample.jpg';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heartIconReg from '@/assets/heartIconReg.svg';
import heartIcon from '@/assets/heartIcon.svg';
import { openExternalLink } from '@/utils/browserHelper';
import { stripHtml, decodeHtmlEntities } from '@/utils/textHelpers';
import {
  addFavorite,
  removeFavorite,
  listFavorites,
} from '@/services/favoriteService';
import { getValidToken } from '@/lib/auth';
import { toast } from '@/lib/toast.tsx';

interface CategoryProductsViewProps {
  categorySlug: string;
}

export function CategoryProductsView({
  categorySlug,
}: CategoryProductsViewProps) {
  const navigate = useNavigate();

  // Favorite state
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loadingFavoriteId, setLoadingFavoriteId] = useState<number | null>(null);

  // Use infinite scroll query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingProducts,
  } = useInfiniteProductsByCategory(categorySlug, 15, true);

  // Flatten all pages of products
  const products = useMemo(() => {
    if (!data) return [];
    return (data as any).pages.flatMap((page: any) => page.products);
  }, [data]);

  // Intersection observer ref for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isImageFading, setIsImageFading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<typeof products>([]);

  // Load favorites
  useEffect(() => {
    (async () => {
      const token = await getValidToken();
      if (!token) return;
      try {
        const resp = await listFavorites({ page: 1, limit: 200 });
        const ids = new Set<number>(resp.data.map((f) => f.productId));
        setFavoriteIds(ids);
      } catch (e) {
        console.warn('Failed to load favorites list', e);
      }
    })();
  }, []);

  // Handle favorite toggle
  const handleToggleFavorite = async (productId: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const token = await getValidToken();
    if (!token) {
      toast.warning('Please sign in to manage favorites');
      return;
    }
    if (loadingFavoriteId === productId) return;
    setLoadingFavoriteId(productId);
    const isFav = favoriteIds.has(productId);
    setFavoriteIds((s) => {
      const next = new Set(s);
      if (isFav) next.delete(productId);
      else next.add(productId);
      return next;
    });
    try {
      if (isFav) await removeFavorite(productId);
      else await addFavorite(productId);
    } catch {
      setFavoriteIds((s) => {
        const next = new Set(s);
        if (isFav) next.add(productId);
        else next.delete(productId);
        return next;
      });
    } finally {
      setLoadingFavoriteId(null);
    }
  };

  // Setup intersection observer for infinite scroll
  const handleObserver = useCallback(
    (entries: IntersectionObserverEntry[]) => {
      const [target] = entries;
      if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    },
    [fetchNextPage, hasNextPage, isFetchingNextPage]
  );

  useEffect(() => {
    const element = observerTarget.current;
    if (!element) return;

    const option = { threshold: 0 };
    const observer = new IntersectionObserver(handleObserver, option);
    observer.observe(element);

    return () => observer.unobserve(element);
  }, [handleObserver]);

  // Select 3 random products for featured section
  useEffect(() => {
    if (products.length > 0) {
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      setFeaturedProducts(shuffled.slice(0, Math.min(3, products.length)));
      setCurrentProductIndex(0);
    }
  }, [products]);

  // Auto-rotate featured products every 4 seconds
  useEffect(() => {
    if (featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      setIsImageFading(true);

      setTimeout(() => {
        setCurrentProductIndex((prev) => (prev + 1) % featuredProducts.length);
        setIsImageFading(false);
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  // Transform products for the Products component
  const productsGridData = products.map((product: (typeof products)[0]) => ({
    id: product.id,
    image:
      product._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      profileSampleImage,
    price: product.meta.cta_button_text || 'View Product',
    productName: decodeHtmlEntities(product.title.rendered),
    description: stripHtml(product.content.rendered).substring(0, 100),
    rating: 4.5,
  }));

  if (isLoadingProducts) {
    return (
      <div className="mt-6">
        {/* Featured Skeleton */}
        <div className="relative rounded-3xl overflow-hidden bg-white shadow-lg">
          <div className="h-[280px] bg-gradient-to-br from-primary/10 to-primary/5 animate-pulse" />
          <div className="p-5">
            <div className="h-6 w-3/4 bg-primary/10 rounded-lg animate-pulse mb-3" />
            <div className="h-4 w-full bg-primary/10 rounded animate-pulse mb-2" />
            <div className="h-4 w-5/6 bg-primary/10 rounded animate-pulse mb-4" />
            <div className="h-12 w-full bg-primary/10 rounded-xl animate-pulse" />
          </div>
        </div>

        {/* Products Grid Skeleton */}
        <div className="mt-6">
          <div className="h-5 w-24 bg-primary/10 rounded animate-pulse mb-4" />
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="bg-white rounded-2xl shadow-md p-3">
                <div className="h-[120px] w-full rounded-xl bg-primary/10 animate-pulse mb-3" />
                <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse mb-2" />
                <div className="h-3 w-full bg-primary/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-6">
      {/* Featured Product Carousel */}
      {featuredProducts.length > 0 && (
        <div className="relative rounded-3xl overflow-hidden bg-white shadow-[0_8px_30px_rgba(0,0,0,0.12)]">
          {/* Image Container */}
          <div className="relative h-[280px] w-full overflow-hidden">
            <div
              className={`w-full h-full transition-opacity duration-300 ${
                isImageFading ? 'opacity-0' : 'opacity-100'
              }`}
            >
              <img
                src={
                  featuredProducts[currentProductIndex]._embedded?.[
                    'wp:featuredmedia'
                  ]?.[0]?.source_url || profileSampleImage
                }
                alt={featuredProducts[currentProductIndex].title.rendered}
                className="w-full h-full object-cover"
              />
            </div>

            {/* Gradient Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

            {/* Favorite Button */}
            <button
              onClick={(e) =>
                handleToggleFavorite(
                  featuredProducts[currentProductIndex].id,
                  e
                )
              }
              disabled={loadingFavoriteId === featuredProducts[currentProductIndex].id}
              className="absolute top-4 right-4 w-10 h-10 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center shadow-lg hover:bg-white transition-all disabled:opacity-60"
            >
              <img
                src={
                  favoriteIds.has(featuredProducts[currentProductIndex].id)
                    ? heartIcon
                    : heartIconReg
                }
                alt="Favorite"
                className="w-5 h-5"
              />
            </button>

            {/* Featured Badge */}
            <div className="absolute top-4 left-4 bg-secondary/90 backdrop-blur-sm text-white text-xs font-semibold px-3 py-1.5 rounded-full">
              Featured
            </div>

            {/* Progress Indicator */}
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2">
              {featuredProducts.map((_: unknown, index: number) => (
                <button
                  key={index}
                  onClick={() => {
                    setIsImageFading(true);
                    setTimeout(() => {
                      setCurrentProductIndex(index);
                      setIsImageFading(false);
                    }, 150);
                  }}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    index === currentProductIndex
                      ? 'w-8 bg-white'
                      : 'w-2 bg-white/50 hover:bg-white/70'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Content */}
          <div className="p-5">
            <h3 className="text-primary font-family-segoe text-xl font-bold capitalize line-clamp-1 mb-2">
              {decodeHtmlEntities(
                featuredProducts[currentProductIndex].title.rendered
              )}
            </h3>
            <p className="text-gray-600 text-sm font-family-roboto line-clamp-2 mb-4 leading-relaxed">
              {stripHtml(
                featuredProducts[currentProductIndex].content.rendered
              )}
            </p>

            <div className="flex gap-3">
              <Button
                onClick={() => {
                  const link =
                    featuredProducts[currentProductIndex]?.meta?.cta_button_url;
                  if (link) {
                    openExternalLink(link);
                  }
                }}
                className="flex-1 h-12 font-semibold text-[15px] text-white rounded-xl shadow-md hover:shadow-lg transition-all"
              >
                Buy Now
              </Button>
              <button
                onClick={() =>
                  navigate(
                    `/products/${featuredProducts[currentProductIndex].id}`
                  )
                }
                className="h-12 px-5 border-2 border-primary text-primary font-semibold text-[15px] rounded-xl hover:bg-primary/5 transition-colors"
              >
                Details
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Products Section */}
      <section className="mt-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-800">All Products</h2>
          <span className="text-sm text-gray-500">
            {productsGridData.length} items
          </span>
        </div>

        {productsGridData.length > 0 ? (
          <>
            <Products
              data={productsGridData}
              onProductClick={(productId) => navigate(`/products/${productId}`)}
            />

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="w-full py-6">
              {isFetchingNextPage && (
                <div className="flex justify-center items-center">
                  <div className="relative">
                    <div className="w-10 h-10 border-4 border-primary/20 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
                  </div>
                </div>
              )}
              {!hasNextPage && products.length > 0 && (
                <div className="flex flex-col items-center justify-center py-4">
                  <div className="w-12 h-[2px] bg-gray-200 rounded-full mb-3" />
                  <p className="text-gray-400 text-sm">You've seen all products</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center py-16">
            <div className="w-20 h-20 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="32"
                height="32"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#650084"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z" />
                <path d="M3 6h18" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
            <h3 className="text-gray-800 font-semibold text-lg mb-1">
              No products yet
            </h3>
            <p className="text-gray-500 text-sm text-center max-w-[250px]">
              Products will appear here once they're added to this category
            </p>
          </div>
        )}
      </section>
    </div>
  );
}
