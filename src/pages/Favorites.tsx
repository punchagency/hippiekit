import favoritesIcon from '@/assets/favoritesIcon.svg';
import { SearchIcon } from '@/assets/homeIcons';
import { Categories } from '@/components/Categories';
import profileSampleImage from '@/assets/profileImgSample.jpg';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import productGridImage from '@/assets/productGridImage.png';

import {
  listFavorites,
  listFavoriteCategories,
  removeFavorite,
  type FavoriteItem,
} from '@/services/favoriteService';
import ProductInfo from '@/components/ProductInfo';
import { PageHeader } from '@/components/PageHeader';
import { decodeHtmlEntities } from '@/utils/textHelpers';
import { PullToRefresh } from '@/components/PullToRefresh';

const Favorites = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<
    Array<{
      id: number;
      name: string;
      slug: string;
      count: number;
      image?: string;
    }>
  >([]);
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const observerTarget = useRef<HTMLDivElement>(null);

  const categoryParam: string = searchParams.get('category') || '';
  const searchParam: string = searchParams.get('search') || '';

  // Load favorites function
  const loadFavorites = useCallback(
    async (pageNum: number, reset: boolean = false) => {
      try {
        if (reset) {
          setIsLoadingProducts(true);
        } else {
          setIsLoadingMore(true);
        }

        const response = await listFavorites({
          page: pageNum,
          limit: 15,
          category: categoryParam || undefined,
          search: searchQuery.trim() || undefined,
        });

        if (response.success) {
          setHasMore(response.meta.hasMore);
          setFavorites((prev) =>
            reset ? response.data : [...prev, ...response.data]
          );
        } else {
          setFavorites([]);
          setHasMore(false);
        }
      } catch (error) {
        console.error('Failed to load favorites:', error);
        if (reset) {
          setFavorites([]);
        }
        setHasMore(false);
      } finally {
        setIsLoadingProducts(false);
        setIsLoadingMore(false);
      }
    },
    [categoryParam, searchQuery]
  );

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    setPage(1);
    setHasMore(true);
    await loadFavorites(1, true);
  }, [loadFavorites]);

  // Initialize search query from URL on mount
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  // Load favorite categories
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const response = await listFavoriteCategories();
        if (response.success) {
          setCategories(response.data);
        } else {
          setCategories([]);
        }
      } catch (error) {
        console.error('Failed to load favorite categories:', error);
        setCategories([]);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []); // Load categories once on mount

  // Load initial favorites when category or search changes
  useEffect(() => {
    setFavorites([]);
    setPage(1);
    setHasMore(true);
    loadFavorites(1, true);
  }, [categoryParam, searchQuery, loadFavorites]);

  const handleCategoryClick = (
    _categoryId: number,
    categorySlug: string,
    _hasSubcategories?: boolean
  ) => {
    const newParams: Record<string, string> = { category: categorySlug };
    if (searchQuery.trim()) newParams.search = searchQuery.trim();
    setSearchParams(newParams);
  };

  // Handle category deselection
  const handleDeselectCategory = () => {
    const newParams: Record<string, string> = {};
    if (searchQuery.trim()) newParams.search = searchQuery.trim();
    setSearchParams(newParams);
  };

  // Infinite scroll observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        if (
          entries[0].isIntersecting &&
          hasMore &&
          !isLoadingMore &&
          !isLoadingProducts
        ) {
          const nextPage = page + 1;
          setPage(nextPage);
          loadFavorites(nextPage, false);
        }
      },
      { threshold: 0.1 }
    );

    const currentTarget = observerTarget.current;
    if (currentTarget) {
      observer.observe(currentTarget);
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget);
      }
    };
  }, [hasMore, isLoadingMore, isLoadingProducts, page, loadFavorites]);

  // Transform categories for the Categories component
  const categoryProducts = categories.map((cat) => ({
    id: cat.id,
    name: decodeHtmlEntities(cat.name),
    slug: cat.slug,
    price: '', // Not applicable for categories
    image: cat.image || productGridImage, // Use category image or fallback
    items: cat.count.toString(),
    parent: 0, // Favorite categories don't have parent info
  }));

  // Reorder categories to show selected category first
  const reorderedCategories = categoryParam
    ? [
        ...categoryProducts.filter((cat) => cat.slug === categoryParam),
        ...categoryProducts.filter((cat) => cat.slug !== categoryParam),
      ]
    : categoryProducts;

  // Handle removing favorite
  const handleToggleFavorite = async (productId: number) => {
    // Optimistic update: remove from UI immediately
    const previousFavorites = [...favorites];
    setFavorites((prev) => prev.filter((fav) => fav.productId !== productId));

    try {
      await removeFavorite(productId);
    } catch (error) {
      console.error('Error removing favorite:', error);
      // Rollback on error
      setFavorites(previousFavorites);
    }
  };

  // Transform favorites for the ProductInfo component
  const productsGridData = favorites.map((favorite) => ({
    id: favorite.productId,
    image: favorite.product.image || profileSampleImage,
    price: favorite.product.priceText || 'View Product',
    productName: decodeHtmlEntities(favorite.product.title),
    description: decodeHtmlEntities(favorite.product.title), // Use title as description since we don't have full content
    rating: 4.5,
  }));

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <header className="px-5 pt-6 pb-4">
        <PageHeader
          title="Favorites"
          titleIconSrc={favoritesIcon}
          showNotification
        />

        {/* Search Bar */}
        <div className="relative mb-4">
          <div className="flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                type="text"
                placeholder="Search Here For Specific Item"
                value={searchQuery}
                onChange={(e) => {
                  const value = e.target.value;
                  setSearchQuery(value);
                  // Update URL params
                  const newParams: Record<string, string> = {};
                  if (categoryParam) newParams.category = categoryParam;
                  if (value.trim()) newParams.search = value.trim();
                  setSearchParams(newParams);
                }}
                className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 focus:outline-none focus:border-primary p-2.5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
              />
              <div className="absolute left-3 top-1/2 -translate-y-1/2">
                <SearchIcon />
              </div>
            </div>
          </div>
        </div>

        <section className=" rounded-[7px] px-4 py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex flex-col gap-7.5 ">
          <div className="flex justify-between">
            <h2 className="text-primary font-family-segoe text-[18px] font-bold capitalize">
              Top Categories
            </h2>

            <button
              className="text-[#848484] underline text-sm sm:text-base"
              onClick={() => navigate('/categories?from=favorites')}
            >
              See all
            </button>
          </div>

          {isLoadingCategories ? (
            <div className="flex gap-2 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
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
                categoryParam={categoryParam}
                onCategoryClick={handleCategoryClick}
                onDeselectCategory={handleDeselectCategory}
                products={reorderedCategories}
                selection="filter"
              />
            </div>
          ) : (
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-500">No categories available</p>
            </div>
          )}
        </section>

        <div className="mt-3.5 flex flex-col gap-2.5">
          {isLoadingProducts ? (
            <>
              {[...Array(5)].map((_, index) => (
                <div
                  key={index}
                  className="bg-white rounded-[13px] w-full shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-3"
                >
                  {/* Image skeleton */}
                  <div className="w-[60px] h-[60px] rounded-lg bg-primary/10 animate-pulse" />

                  {/* Content skeleton */}
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
                    <div className="h-3 w-full bg-primary/10 rounded animate-pulse" />
                    <div className="h-3 w-5/6 bg-primary/10 rounded animate-pulse" />
                  </div>

                  {/* Heart icon skeleton */}
                  <div className="w-[22px] h-[22px] bg-primary/10 rounded-sm animate-pulse" />
                </div>
              ))}
            </>
          ) : productsGridData.length > 0 ? (
            <>
              {productsGridData.map((product, index) => (
                <ProductInfo
                  key={`${product.id}-${index}`}
                  name={product.productName}
                  description={product.description}
                  img={product.image}
                  isFavorite={true}
                  onClick={() => navigate(`/products/${product.id}`)}
                  onToggleFavorite={() => handleToggleFavorite(product.id)}
                />
              ))}

              {/* Infinite scroll trigger */}
              <div
                ref={observerTarget}
                className="h-10 flex items-center justify-center"
              >
                {isLoadingMore && (
                  <div className="w-full bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-3">
                    <div className="w-[60px] h-[60px] rounded-lg bg-primary/10 animate-pulse" />
                    <div className="flex flex-col flex-1 gap-2">
                      <div className="h-4 w-3/4 bg-primary/10 rounded animate-pulse" />
                      <div className="h-3 w-full bg-primary/10 rounded animate-pulse" />
                    </div>
                    <div className="w-[22px] h-[22px] bg-primary/10 rounded-sm animate-pulse" />
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex justify-center items-center py-8">
              <p className="text-gray-500">
                {searchQuery.trim()
                  ? 'No products found'
                  : 'No products available'}
              </p>
            </div>
          )}
        </div>
      </header>
    </PullToRefresh>
  );
};

export default Favorites;
