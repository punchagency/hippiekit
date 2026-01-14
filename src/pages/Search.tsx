import { FilterIcon, SearchIcon } from '@/assets/homeIcons';
import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import clock from '@/assets/Clock.svg';
import { SearchDisplayIcon } from '@/assets/icons';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  useCategories,
  useInfiniteSearchProducts,
} from '@/services/categoryService';
import ProductInfo from '@/components/ProductInfo';
import {
  addFavorite,
  removeFavorite,
  listFavorites,
} from '@/services/favoriteService';
import {
  getSearchHistory as fetchSearchHistory,
  addSearchHistory as saveSearchHistory,
} from '@/services/searchHistoryService';
import { getValidToken } from '@/lib/auth';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import profileSampleImage from '@/assets/profileImgSample.jpg';
import { toast } from '@/lib/toast.tsx';
import { stripHtml, decodeHtmlEntities } from '@/utils/textHelpers';
import { PageHeader } from '@/components/PageHeader';
import { PullToRefresh } from '@/components/PullToRefresh';
import { useQueryClient } from '@tanstack/react-query';

export const Search = () => {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const queryClient = useQueryClient();
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loadingFavoriteIds, setLoadingFavoriteIds] = useState<Set<number>>(
    new Set()
  );
  const [searchHistory, setSearchHistory] = useState<string[]>([]);

  // Intersection observer ref for infinite scroll
  const observerTarget = useRef<HTMLDivElement>(null);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    // Only refresh search results, not categories (categories are long-lived)
    await queryClient.invalidateQueries({ queryKey: ['search-products'] });
  }, [queryClient]);

  // Use cached queries
  const { data: categories = [] } = useCategories();
  const {
    data: searchData,
    isLoading,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
  } = useInfiniteSearchProducts(
    debouncedQuery,
    selectedCategory || undefined,
    15
  );

  // Flatten all pages of products with useMemo
  const products = useMemo(() => {
    if (!searchData) return [];
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    return (searchData as any).pages.flatMap((page: any) => page.products);
  }, [searchData]);

  const hasSearched = !!debouncedQuery.trim();

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

  // Initialize from URL params and hydrate debounced query so cached results persist on back navigation
  useEffect(() => {
    const searchParam = searchParams.get('search') || '';
    const categoryParam = searchParams.get('category') || '';
    setSearchQuery(searchParam);
    setDebouncedQuery(searchParam.trim());
    setSelectedCategory(categoryParam);
  }, [searchParams]);

  // Load search history from backend
  useEffect(() => {
    (async () => {
      const token = await getValidToken();
      if (!token) return;

      try {
        const history = await fetchSearchHistory();
        setSearchHistory(history);
      } catch (e) {
        console.warn('Failed to load search history', e);
      }
    })();
  }, []);

  // Load user's favorites
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

  // Handle search submission (triggered on Enter key)
  const handleSearch = async () => {
    setDebouncedQuery(searchQuery.trim());
    // Update URL params
    const newParams: Record<string, string> = {};
    if (searchQuery.trim()) newParams.search = searchQuery.trim();
    if (selectedCategory) newParams.category = selectedCategory;
    setSearchParams(newParams);

    // Save to backend search history
    if (searchQuery.trim()) {
      try {
        const updatedHistory = await saveSearchHistory(searchQuery.trim());
        setSearchHistory(updatedHistory);
      } catch (e) {
        console.warn('Failed to save search history', e);
      }
    }
  };

  // Save to search history when search is performed (removed localStorage logic)
  // This effect is now handled in handleSearch function

  // Handle favorite toggle
  const handleToggleFavorite = async (productId: number) => {
    const token = await getValidToken();
    if (!token) {
      toast.warning('Please sign in to manage favorites');
      return;
    }
    if (loadingFavoriteIds.has(productId)) return;

    const isFavorite = favoriteIds.has(productId);
    setLoadingFavoriteIds((prev) => new Set(prev).add(productId));

    // Optimistic update
    setFavoriteIds((prev) => {
      const next = new Set(prev);
      if (isFavorite) {
        next.delete(productId);
      } else {
        next.add(productId);
      }
      return next;
    });

    try {
      if (isFavorite) {
        await removeFavorite(productId);
      } else {
        await addFavorite(productId);
      }
    } catch (err) {
      console.error('Failed to toggle favorite', err);
      // Rollback
      setFavoriteIds((prev) => {
        const next = new Set(prev);
        if (isFavorite) {
          next.add(productId);
        } else {
          next.delete(productId);
        }
        return next;
      });
    } finally {
      setLoadingFavoriteIds((prev) => {
        const next = new Set(prev);
        next.delete(productId);
        return next;
      });
    }
  };

  // Handle search from history
  const handleHistoryClick = (query: string) => {
    setSearchQuery(query);
    // Update URL params
    const newParams: Record<string, string> = { search: query };
    if (selectedCategory) newParams.category = selectedCategory;
    setSearchParams(newParams);
  };

  // Handle category filter
  const handleCategorySelect = (categorySlug: string) => {
    const newCategory = selectedCategory === categorySlug ? '' : categorySlug;
    setSelectedCategory(newCategory);

    // Update URL params
    const newParams: Record<string, string> = {};
    if (searchQuery.trim()) newParams.search = searchQuery.trim();
    if (newCategory) newParams.category = newCategory;
    setSearchParams(newParams);
  };

  // Transform products for display
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
      <section className="relative pt-6 mx-7 pb-4">
        <PageHeader
          title="Search"
          onBack={() => navigate('/')}
          showNotification
          className="mb-4"
        />

        {/* Search Bar */}
        <div className="relative mt-9 mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search Here For Specific Item"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    handleSearch();
                  }
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </div>
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </div>
            </div>
            <button
              onClick={() => setIsFilterOpen(true)}
              className={`p-3 bg-white rounded-lg border ${
                selectedCategory
                  ? 'border-primary bg-primary/5'
                  : 'border-gray-200'
              }`}
            >
              <FilterIcon />
            </button>
          </div>
        </div>

        {/* Filter indicator */}
        {selectedCategory && (
          <div className="mb-4 flex items-center gap-2">
            <span className="text-sm text-gray-600">
              Filtered by:{' '}
              <span className="font-semibold text-primary">
                {categories.find((c) => c.slug === selectedCategory)?.name}
              </span>
            </span>
            <button
              onClick={() => {
                setSelectedCategory('');
                // Update URL params
                const newParams: Record<string, string> = {};
                if (searchQuery.trim()) newParams.search = searchQuery.trim();
                setSearchParams(newParams);
              }}
              className="text-xs text-primary underline"
            >
              Clear
            </button>
          </div>
        )}

        {/* Search Results or History */}
        {isLoading ? (
          <div className="flex flex-col gap-2.5">
            {[...Array(5)].map((_, index) => (
              <div
                key={index}
                className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-3"
              >
                <div className="w-[60px] h-[60px] rounded-lg bg-primary/10 animate-pulse" />
                <div className="flex flex-col flex-1 gap-2">
                  <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
                  <div className="h-3 w-full bg-primary/10 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-primary/10 rounded animate-pulse" />
                </div>
                <div className="w-[22px] h-[22px] bg-primary/10 rounded-sm animate-pulse" />
              </div>
            ))}
          </div>
        ) : hasSearched && productsGridData.length > 0 ? (
          <>
            <div className="flex flex-col gap-2.5">
              {productsGridData.map((product: (typeof productsGridData)[0]) => (
                <ProductInfo
                  key={product.id}
                  name={product.productName}
                  description={product.description}
                  img={product.image}
                  isFavorite={favoriteIds.has(product.id)}
                  onClick={() => navigate(`/products/${product.id}`)}
                  onToggleFavorite={() => handleToggleFavorite(product.id)}
                />
              ))}
            </div>

            {/* Infinite scroll trigger */}
            <div ref={observerTarget} className="w-full py-4">
              {isFetchingNextPage && (
                <div className="flex justify-center items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
                </div>
              )}
              {!hasNextPage && products.length > 0 && (
                <div className="flex justify-center items-center">
                  <p className="text-gray-500 text-sm">No more results</p>
                </div>
              )}
            </div>
          </>
        ) : hasSearched && productsGridData.length === 0 ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">
              No products found for "{debouncedQuery}"
            </p>
          </div>
        ) : searchHistory.length > 0 ? (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-3">
              Recent Searches
            </h3>
            {searchHistory.map((item, index) => (
              <div
                key={index}
                onClick={() => handleHistoryClick(item)}
                className="flex font-family-roboto text-[16px] justify-between mx-2 gap-3.5 py-3.5 border-b border-[#DADADA] cursor-pointer hover:bg-gray-50"
              >
                <div className="flex gap-4 items-center">
                  <img src={clock} alt="" />
                  {item}
                </div>
                <SearchDisplayIcon />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">Start searching for products...</p>
          </div>
        )}

        {/* Filter Sheet */}
        <Sheet open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <SheetContent side="bottom" className="h-[70vh] bg-white">
            <SheetHeader>
              <SheetTitle className="text-primary font-family-segoe text-[18px] font-bold">
                Filter by Category
              </SheetTitle>
            </SheetHeader>
            <div className="flex-1 overflow-y-auto px-4 pb-4">
              <div className="flex flex-col gap-2">
                {/* All Categories option */}
                <button
                  onClick={() => {
                    setSelectedCategory('');
                    setIsFilterOpen(false);
                    // Update URL params
                    const newParams: Record<string, string> = {};
                    if (searchQuery.trim())
                      newParams.search = searchQuery.trim();
                    setSearchParams(newParams);
                  }}
                  className={`text-left p-3 rounded-lg border ${
                    !selectedCategory
                      ? 'border-primary bg-primary/5 text-primary font-semibold'
                      : 'border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  All Categories
                </button>

                {/* Category list */}
                {categories.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      handleCategorySelect(category.slug);
                      setIsFilterOpen(false);
                    }}
                    className={`text-left p-3 rounded-lg border flex justify-between items-center ${
                      selectedCategory === category.slug
                        ? 'border-primary bg-primary/5 text-primary font-semibold'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <span>{category.name}</span>
                    <span className="text-sm text-gray-500">
                      {category.count} items
                    </span>
                  </button>
                ))}
              </div>
            </div>
          </SheetContent>
        </Sheet>
      </section>
    </PullToRefresh>
  );
};
