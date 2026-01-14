import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { Products } from '@/components/Products';
import profileSampleImage from '@/assets/profileImgSample.jpg';
import heartIconReg from '@/assets/heartIconReg.svg';
import OptionIcon from '@/assets/optionsIcon.svg';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useInfiniteLatestProducts } from '@/services/categoryService';
import { stripHtml, decodeHtmlEntities } from '@/utils/textHelpers';
import { openExternalLink } from '@/utils/browserHelper';
import { PageHeader } from '@/components/PageHeader';
import { PullToRefresh } from '@/components/PullToRefresh';
import { useQueryClient } from '@tanstack/react-query';

const MonthlySpecials = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({ queryKey: ['latest-products'] });
  }, [queryClient]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading: isLoadingProducts,
  } = useInfiniteLatestProducts(15);

  const products = useMemo(() => {
    if (!data) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (data as any).pages.flatMap((page: any) => page.products);
  }, [data]);

  const observerTarget = useRef<HTMLDivElement>(null);
  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isImageFading, setIsImageFading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<typeof products>([]);

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

  // Pick first 3 newest products for featured section
  useEffect(() => {
    if (products.length > 0) {
      setFeaturedProducts(products.slice(0, Math.min(3, products.length)));
      setCurrentProductIndex(0);
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
      }, 300);
    }, 4000);

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

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

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="px-4">
        <PageHeader title="Monthly Specials" showNotification />
        {isLoadingProducts ? (
          <div className="w-full h-[408px] rounded-[14px] bg-white p-3.5 gap-4 flex flex-col">
            <div className="rounded-[14px] p-3.5 flex flex-col gap-4 shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
              <div className="relative h-[202px] w-full overflow-hidden rounded-[10px] bg-primary/10 animate-pulse" />

              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="h-6 w-3/4 bg-primary/10 rounded animate-pulse mb-2" />
                  <div className="h-4 w-full bg-primary/10 rounded animate-pulse mb-1" />
                  <div className="h-4 w-5/6 bg-primary/10 rounded animate-pulse mb-1" />
                  <div className="h-4 w-4/6 bg-primary/10 rounded animate-pulse" />
                </div>

                <div className="w-6 h-6 bg-primary/10 rounded animate-pulse ml-2" />
              </div>

              <div className="h-12 w-full bg-primary/10 rounded-lg animate-pulse" />
            </div>
          </div>
        ) : (
          featuredProducts.length > 0 && (
            <div className="w-full h-[408px] rounded-[14px] bg-white p-3.5 gap-4 flex flex-col">
              <div className="rounded-[14px] p-3.5 flex flex-col gap-4 shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]">
                <div className="relative h-[202px] w-full overflow-hidden rounded-[10px]">
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

                  <button className="absolute top-2.5 right-3 bg-[rgba(255,255,255,0.3)] p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)] z-10">
                    <img src={heartIconReg} alt="" />
                  </button>

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
                  <div>
                    <h3 className="text-primary text-[18px] font-family-segoe font-bold capitalize line-clamp-1">
                      {featuredProducts[currentProductIndex].title.rendered}
                    </h3>
                    <p className="text-[14px] font-family-roboto line-clamp-3 mt-1">
                      {stripHtml(
                        featuredProducts[currentProductIndex].content.rendered
                      )}
                    </p>
                  </div>

                  <button>
                    <img src={OptionIcon} alt="" />
                  </button>
                </div>

                <Button
                  onClick={() => {
                    const link =
                      featuredProducts[currentProductIndex]?.meta
                        ?.cta_button_url;
                    if (link) {
                      openExternalLink(link);
                    } else {
                      console.warn('No link available for this product');
                    }
                  }}
                  className="font-semibold text-[16px] text-white"
                >
                  Buy Now
                </Button>
              </div>
            </div>
          )
        )}

        <section className="mx-4.5 mt-4">
          {isLoadingProducts ? (
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[...Array(4)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2 sm:p-2.5 flex flex-col gap-2 sm:gap-2.5 shrink-0 w-40 sm:w-[180px]"
                >
                  <div className="w-full h-[110px] sm:h-[127px] rounded-lg bg-primary/10 animate-pulse" />
                  <div className="flex flex-col gap-2 sm:gap-3.5">
                    <div className="flex flex-col gap-1.5 sm:gap-2.5">
                      <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
                      <div className="h-3 w-full bg-primary/10 rounded animate-pulse" />
                    </div>
                    <div className="h-6 w-12 bg-primary/10 rounded-[5px] animate-pulse" />
                  </div>
                </div>
              ))}
            </div>
          ) : productsGridData.length > 0 ? (
            <>
              <Products
                data={productsGridData}
                onProductClick={(productId) =>
                  navigate(`/products/${productId}`)
                }
              />

              <div ref={observerTarget} className="w-full py-4">
                {isFetchingNextPage && (
                  <div className="flex justify-center items-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
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
              <p className="text-gray-500">No products available</p>
            </div>
          )}
        </section>
      </div>
    </PullToRefresh>
  );
};

export default MonthlySpecials;
