import { Categories } from '@/components/Categories';
import { CategoryProductsView } from '@/components/CategoryProductsView';
import logo from '@/assets/profileImgSample.jpg';
import { PageHeader } from '@/components/PageHeader';
import {
  useCategories,
  useSubCategories,
  useInfiniteProductsByCategory,
} from '@/services/categoryService';
import { useNavigate, useSearchParams, useLocation } from 'react-router-dom';
import { listFavoriteCategories } from '@/services/favoriteService';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { PullToRefresh } from '@/components/PullToRefresh';
import { useQueryClient } from '@tanstack/react-query';
import type { Category } from '@/services/categoryService';
import { decodeHtmlEntities } from '@/utils/textHelpers';
import { Breadcrumb } from '@/components/Breadcrumb';
import {
  parseCategoryPath,
  buildCategoryPath,
  buildCategoryUrl,
} from '@/utils/categoryPath';
import { SearchIcon } from '@/assets/homeIcons';

const AllCategories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromFavorites = searchParams.get('from') === 'favorites';
  const queryClient = useQueryClient();

  // Parse URL path to get category slugs
  const slugs = parseCategoryPath(location.pathname);
  const currentSlug = slugs.length > 0 ? slugs[slugs.length - 1] : null;

  // State for category path (hierarchical navigation)
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);
  const [showProducts, setShowProducts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  // Use cached query for regular categories (top-level only)
  const { data: wpCategories = [], isLoading: isLoadingWPCategories } =
    useCategories();

  // Get current parent ID from category path
  const currentParentId =
    categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].id : 0;

  // Use cached query for subcategories
  const { data: subcategories = [], isLoading: isLoadingSubcategories } =
    useSubCategories(currentParentId);

  // Prefetch products query when we're about to show products
  useInfiniteProductsByCategory(
    currentSlug || '',
    15,
    showProducts
  );

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    if (showProducts && currentSlug) {
      await queryClient.invalidateQueries({
        queryKey: ['products-by-category', currentSlug],
      });
    }
  }, [queryClient, showProducts, currentSlug]);

  // State for favorite categories
  const [favoriteCategories, setFavoriteCategories] = useState<
    Array<{
      id: number;
      name: string;
      slug: string;
      count: number;
      image?: string;
    }>
  >([]);
  const [isLoadingFavoriteCategories, setIsLoadingFavoriteCategories] =
    useState(false);

  // Load favorite categories if coming from favorites
  useEffect(() => {
    if (fromFavorites) {
      const loadFavoriteCategories = async () => {
        try {
          setIsLoadingFavoriteCategories(true);
          const response = await listFavoriteCategories();
          if (response.success) {
            setFavoriteCategories(response.data);
          } else {
            setFavoriteCategories([]);
          }
        } catch (error) {
          console.error('Failed to load favorite categories:', error);
          setFavoriteCategories([]);
        } finally {
          setIsLoadingFavoriteCategories(false);
        }
      };
      loadFavoriteCategories();
    }
  }, [fromFavorites]);

  // Sync URL → State: Build category path from URL slugs
  const slugPath = slugs.join('/');
  useEffect(() => {
    if (fromFavorites || !wpCategories.length) return;

    const syncUrlToState = async () => {
      if (slugPath === '') {
        setCategoryPath([]);
        return;
      }

      try {
        const slugArray = slugPath.split('/').filter(Boolean);
        const resolvedPath = await buildCategoryPath(slugArray, wpCategories);
        setCategoryPath(resolvedPath);
      } catch (error) {
        console.error('Error resolving category path:', error);
        setCategoryPath([]);
      }
    };

    syncUrlToState();
  }, [slugPath, wpCategories, fromFavorites]);

  // Determine current categories based on parent ID
  const currentCategories =
    currentParentId === 0 ? wpCategories : subcategories;

  // Determine if we should show products - wait for subcategories check to complete
  const shouldShowProducts = useMemo(() => {
    // Don't show products if at root or from favorites
    if (fromFavorites || !currentSlug || categoryPath.length === 0) {
      return false;
    }

    // Wait for subcategories to finish loading before deciding
    if (isLoadingSubcategories) {
      return false;
    }

    // Show products only if we have no subcategories
    if (currentParentId > 0 && subcategories.length === 0) {
      return true;
    }

    return false;
  }, [
    currentSlug,
    fromFavorites,
    categoryPath.length,
    currentParentId,
    subcategories.length,
    isLoadingSubcategories,
  ]);

  useEffect(() => {
    setShowProducts(shouldShowProducts);
  }, [shouldShowProducts]);

  const handleCategoryClick = async (
    _categoryId: number,
    categorySlug: string
  ) => {
    if (fromFavorites) {
      navigate(`/favorites?category=${categorySlug}`);
      return;
    }

    const newSlugs = [...slugs, categorySlug];
    const newUrl = buildCategoryUrl(newSlugs);
    navigate(newUrl);
  };

  // Prefetch subcategories on hover
  const handleCategoryHover = (categoryId: number) => {
    queryClient.prefetchQuery({
      queryKey: ['categories', 'subcategories', categoryId],
      queryFn: async () => {
        const { fetchSubCategories } = await import(
          '@/services/categoryService'
        );
        return fetchSubCategories(categoryId);
      },
    });
  };

  // Use favorite categories when from favorites
  const categories = fromFavorites ? favoriteCategories : currentCategories;
  const isLoadingCategories = fromFavorites
    ? isLoadingFavoriteCategories
    : (isLoadingWPCategories && wpCategories.length === 0) ||
    (isLoadingSubcategories && subcategories.length === 0);

  // Transform categories for the Categories component
  const categoryProducts = categories.map((cat) => {
    const wpCat = cat as Category;
    const favCat = cat as {
      id: number;
      name: string;
      slug: string;
      count: number;
      image?: string;
    };

    return {
      id: cat.id,
      name: decodeHtmlEntities(cat.name),
      slug: cat.slug,
      category: decodeHtmlEntities(cat.name),
      price: '',
      image: fromFavorites
        ? favCat.image || logo
        : wpCat.meta?.featured_image || logo,
      items: cat.count.toString(),
      parent: wpCat.parent || 0,
    };
  });

  // Filter categories by search
  const filteredCategories = searchQuery.trim()
    ? categoryProducts.filter((cat) =>
      cat.name.toLowerCase().includes(searchQuery.toLowerCase())
    )
    : categoryProducts;

  // Determine page title from category path
  const pageTitle =
    categoryPath.length > 0
      ? decodeHtmlEntities(categoryPath[categoryPath.length - 1].name)
      : 'All Categories';

  // Show loading only for initial load when we have no cached data
  const shouldShowInitialLoader =
    (isLoadingWPCategories && wpCategories.length === 0 && categoryPath.length === 0);

  if (shouldShowInitialLoader) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen pt-[env(safe-area-inset-top)]">
        <div className="relative">
          <div className="w-16 h-16 border-4 border-primary/20 rounded-full"></div>
          <div className="absolute top-0 left-0 w-16 h-16 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
        </div>
        <p className="mt-4 text-gray-500 text-sm font-medium">Loading categories...</p>
      </div>
    );
  }

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <section
        className="relative min-h-screen pb-24"
      >
        {/* Header Section */}
        <div className="px-5">
          <PageHeader
            title={pageTitle}
            showBack={categoryPath.length > 0 || fromFavorites}
          />

          {/* Breadcrumb navigation */}
          {!fromFavorites && categoryPath.length > 0 && (
            <Breadcrumb categoryPath={categoryPath} className="mt-3 mb-2" />
          )}

          {/* Search Bar - Only show on main categories page */}
          {categoryPath.length === 0 && !showProducts && !fromFavorites && (
            <div className="mt-4 mb-6">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search categories..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-4 py-3.5 rounded-2xl border-0 bg-white shadow-[0_2px_12px_rgba(0,0,0,0.08)] focus:outline-none focus:ring-2 focus:ring-primary/30 text-[15px] placeholder:text-gray-400 transition-all"
                />
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <SearchIcon />
                </div>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
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
                    >
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Loading state for subcategories */}
        {isLoadingSubcategories && currentParentId > 0 && !showProducts ? (
          <div className="px-5">
            <div className="flex items-center justify-between mb-4">
              <div className="h-4 w-24 bg-primary/10 rounded animate-pulse" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden">
                  <div className="h-32 bg-primary/10 animate-pulse" />
                </div>
              ))}
            </div>
          </div>
        ) : showProducts ? (
          // PRODUCT VIEW
          <div className="px-5">
            <CategoryProductsView categorySlug={currentSlug || ''} />
          </div>
        ) : (
          // CATEGORY VIEW
          <div className="px-5">
            {/* Category Stats Header */}
            {filteredCategories.length > 0 && (
              <div className="flex items-center justify-between mb-4">
                <p className="text-gray-500 text-sm">
                  {filteredCategories.length} {filteredCategories.length === 1 ? 'category' : 'categories'}
                  {searchQuery && ' found'}
                </p>
                {categoryPath.length === 0 && !fromFavorites && (
                  <div className="flex items-center gap-1.5 text-primary text-sm font-medium">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                    </svg>
                    <span>Browse</span>
                  </div>
                )}
              </div>
            )}

            {isLoadingCategories ? (
              <div className="grid grid-cols-2 gap-4">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="bg-white rounded-2xl shadow-md overflow-hidden">
                    <div className="h-32 bg-primary/10 animate-pulse" />
                  </div>
                ))}
              </div>
            ) : filteredCategories.length > 0 ? (
              <Categories
                products={filteredCategories}
                selection={fromFavorites ? 'filter' : 'hierarchical'}
                onCategoryClick={handleCategoryClick}
                onHoverCategory={fromFavorites ? undefined : handleCategoryHover}
              />
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
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                  </svg>
                </div>
                <h3 className="text-gray-800 font-semibold text-lg mb-1">
                  {searchQuery ? 'No matches found' : 'No categories yet'}
                </h3>
                <p className="text-gray-500 text-sm text-center max-w-[250px]">
                  {searchQuery
                    ? `We couldn't find any categories matching "${searchQuery}"`
                    : categoryPath.length > 0
                      ? 'This category has no subcategories'
                      : 'Categories will appear here once available'}
                </p>
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="mt-4 px-5 py-2.5 bg-primary text-white rounded-xl font-medium text-sm hover:bg-primary/90 transition-colors"
                  >
                    Clear search
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </section>
    </PullToRefresh>
  );
};

export default AllCategories;
