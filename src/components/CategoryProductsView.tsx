import { Products } from '@/components/Products';
import { useInfiniteProductsByCategory } from '@/services/categoryService';
import { useEffect, useState, useRef, useCallback, useMemo } from 'react';
import profileSampleImage from '@/assets/profileImgSample.jpg';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import heartIconReg from '@/assets/heartIconReg.svg';
import OptionIcon from '@/assets/optionsIcon.svg';
import { openExternalLink } from '@/utils/browserHelper';
import { stripHtml, decodeHtmlEntities } from '@/utils/textHelpers';

interface CategoryProductsViewProps {
  categorySlug: string;
}

export function CategoryProductsView({
  categorySlug,
}: CategoryProductsViewProps) {
  console.log('🎯 CategoryProductsView render:', { categorySlug });

  const navigate = useNavigate();

  // Use infinite scroll query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingProducts,
  } = useInfiniteProductsByCategory(categorySlug, 15, true);

  console.log('📋 CategoryProductsView query state:', {
    categorySlug,
    isLoadingProducts,
    hasData: !!data,
  });

  // Flatten all pages of products with useMemo
  const products = useMemo(() => {
    if (!data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flatProducts = (data as any).pages.flatMap(
      (page: any) => page.products
    );
    console.log('📦 Products flattened:', { count: flatProducts.length });
    return flatProducts;
  }, [data]);

  // Intersection observer ref for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isImageFading, setIsImageFading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<typeof products>([]);

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

  // Select 3 random products for featured section when products load
  useEffect(() => {
    if (products.length > 0) {
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      setFeaturedProducts(shuffled.slice(0, Math.min(3, products.length)));
      setCurrentProductIndex(0);
      console.log('⭐ Featured products set:', {
        count: Math.min(3, products.length),
      });
    }
  }, [products]);

  // Auto-rotate featured products every 4 seconds with fade effect
  useEffect(() => {
    if (featuredProducts.length <= 1) return;

    const interval = setInterval(() => {
      setIsImageFading(true);

      setTimeout(() => {
        setCurrentProductIndex((prev) => (prev + 1) % featuredProducts.length);
        setIsImageFading(false);
      }, 300); // Fade out duration
    }, 4000); // Change product every 4 seconds

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
    console.log('⏳ CategoryProductsView: Showing loading spinner');
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#650084', borderTopColor: 'transparent' }}
        ></div>
      </div>
    );
  }

  console.log('🎯 CategoryProductsView: Rendering products view', {
    featuredCount: featuredProducts.length,
    totalProducts: productsGridData.length,
  });

  return (
    <div className="mt-6">
      {featuredProducts.length > 0 && (
        <div className="w-full rounded-[14px] bg-white p-3.5 gap-4 flex flex-col">
          <div
            onClick={() =>
              navigate(`/products/${featuredProducts[currentProductIndex].id}`)
            }
            className="rounded-[14px] p-3.5 flex flex-col gap-4 shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] cursor-pointer hover:shadow-lg transition-shadow"
          >
            <div className="relative h-[202px] w-full overflow-hidden rounded-[10px]">
              {/* Featured Product Image with Fade Effect */}
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

              {/* Heart Icon */}
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Add to favorites logic here
                }}
                className="absolute top-2.5 right-3 bg-[rgba(255,255,255,0.3)] p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)] z-10"
              >
                <img src={heartIconReg} alt="" />
              </button>

              {/* Progress Indicator */}
              <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                {featuredProducts.map((_: unknown, index: number) => (
                  <div
                    key={index}
                    className={`h-1 rounded-full transition-all duration-300 ${
                      index === currentProductIndex
                        ? 'w-6 bg-secondary'
                        : 'w-1 bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-primary text-[18px] font-family-segoe font-bold capitalize line-clamp-1">
                  {decodeHtmlEntities(
                    featuredProducts[currentProductIndex].title.rendered
                  )}
                </h3>
                <div
                  className="text-[14px] font-family-roboto mt-1 leading-relaxed text-gray-600 line-clamp-3 [&_p]:space-y-2 [&_br]:block [&_br]:my-2 [&_strong]:font-bold [&_em]:italic"
                  dangerouslySetInnerHTML={{
                    __html:
                      featuredProducts[currentProductIndex].excerpt?.rendered ??
                      featuredProducts[currentProductIndex].content?.rendered ??
                      '',
                  }}
                  style={{
                    lineHeight: '1.6',
                  }}
                />
              </div>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  // Options menu logic here
                }}
              >
                <img src={OptionIcon} alt="" />
              </button>
            </div>

            <Button
              onClick={(e) => {
                e.stopPropagation();
                const link =
                  featuredProducts[currentProductIndex]?.meta?.cta_button_url;
                if (link) {
                  openExternalLink(link);
                } else {
                  console.warn('No Amazon link available for this product');
                }
              }}
              className="font-semibold text-[16px] text-white"
            >
              Buy Now
            </Button>
          </div>
        </div>
      )}

      <section className=" mt-4">
        {productsGridData.length > 0 ? (
          <>
            <Products
              data={productsGridData}
              onProductClick={(productId) => navigate(`/products/${productId}`)}
            />

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="w-full py-4">
              {isFetchingNextPage && (
                <div className="flex justify-center items-center">
                  <div
                    className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"
                    style={{
                      borderColor: '#650084',
                      borderTopColor: 'transparent',
                    }}
                  ></div>
                </div>
              )}
              {!hasNextPage && products.length > 0 && (
                <div className="flex justify-center items-center">
                  <p className="text-gray-500 text-sm">No more products</p>
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">No products in this category yet</p>
          </div>
        )}
      </section>
    </div>
  );
}
