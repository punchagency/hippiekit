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

const AllCategories = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const fromFavorites = searchParams.get('from') === 'favorites';
  const queryClient = useQueryClient();

  // Parse URL path to get category slugs
  const slugs = parseCategoryPath(location.pathname);
  const currentSlug = slugs.length > 0 ? slugs[slugs.length - 1] : null;

  console.log('🔄 AllCategories render:', {
    pathname: location.pathname,
    slugs,
    currentSlug,
  });

  // State for category path (hierarchical navigation)
  const [categoryPath, setCategoryPath] = useState<Category[]>([]);
  const [showProducts, setShowProducts] = useState(false);

  // Use cached query for regular categories (top-level only)
  const { data: wpCategories = [], isLoading: isLoadingWPCategories } =
    useCategories();

  // Get current parent ID from category path
  const currentParentId =
    categoryPath.length > 0 ? categoryPath[categoryPath.length - 1].id : 0;

  // Use cached query for subcategories
  const { data: subcategories = [], isLoading: isLoadingSubcategories } =
    useSubCategories(currentParentId);

  // Check if products are loading (for loading state management)
  const { isLoading: isLoadingProducts } = useInfiniteProductsByCategory(
    currentSlug || '',
    15,
    showProducts
  );

  console.log('📊 Query states:', {
    isLoadingWPCategories,
    isLoadingSubcategories,
    isLoadingProducts,
    currentParentId,
    wpCategoriesCount: wpCategories.length,
    subcategoriesCount: subcategories.length,
  });

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    if (showProducts && currentSlug) {
      // Only refresh products when viewing product list
      await queryClient.invalidateQueries({
        queryKey: ['products-by-category', currentSlug],
      });
    }
    // Don't invalidate categories or subcategories on refresh
    // They are long-lived and cached with 7-day staleTime
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
        // At top level
        setCategoryPath([]);
        return;
      }

      try {
        // Build category path from URL slugs using React Query cache
        const slugArray = slugPath.split('/').filter(Boolean);
        const resolvedPath = await buildCategoryPath(
          slugArray,
          wpCategories,
          queryClient
        );
        setCategoryPath(resolvedPath);
      } catch (error) {
        console.error('Error resolving category path:', error);
        // Reset to top level on error
        setCategoryPath([]);
      }
    };

    syncUrlToState();
  }, [slugPath, wpCategories, fromFavorites, queryClient]);

  // Determine current categories based on parent ID (computed, not state)
  const currentCategories =
    currentParentId === 0 ? wpCategories : subcategories;

  // Determine if we should show products based on whether subcategories exist (memoized)
  const shouldShowProducts = useMemo(() => {
    console.log('🤔 Determining shouldShowProducts:', {
      fromFavorites,
      currentSlug,
      categoryPathLength: categoryPath.length,
      isLoadingSubcategories,
      currentParentId,
      subcategoriesLength: subcategories.length,
    });

    // Don't show products if:
    // - From favorites
    // - No slug (at top level)
    // - No category path yet
    // - Currently loading subcategories
    if (
      fromFavorites ||
      !currentSlug ||
      categoryPath.length === 0 ||
      isLoadingSubcategories
    ) {
      console.log('❌ Not showing products - conditions not met');
      return false;
    }

    // If we're at a category level with no subcategories, show products
    if (currentParentId > 0 && subcategories.length === 0) {
      console.log('✅ Showing products - no subcategories found');
      return true;
    }

    console.log('❌ Not showing products - has subcategories or at top level');
    return false;
  }, [
    currentSlug,
    fromFavorites,
    categoryPath.length,
    currentParentId,
    subcategories.length,
    isLoadingSubcategories,
  ]);

  // Update showProducts state when the computed value changes
  useEffect(() => {
    console.log('🔄 showProducts changed:', shouldShowProducts);
    setShowProducts(shouldShowProducts);
  }, [shouldShowProducts]);

  const handleCategoryClick = async (
    _categoryId: number,
    categorySlug: string
  ) => {
    console.log('🖱️ Category clicked:', { categorySlug });

    if (fromFavorites) {
      // Navigate back to favorites with the selected category
      navigate(`/favorites?category=${categorySlug}`);
      return;
    }

    // Navigate immediately - let the destination page handle loading states
    const newSlugs = [...slugs, categorySlug];
    const newUrl = buildCategoryUrl(newSlugs);
    navigate(newUrl);
  };

  // Prefetch subcategories on hover for better UX
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

  // Use favorite categories when from favorites, otherwise use current categories
  const categories = fromFavorites ? favoriteCategories : currentCategories;

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
      price: '', // Not applicable for categories
      image: fromFavorites
        ? favCat.image || logo
        : wpCat.meta?.featured_image || logo,
      items: cat.count.toString(),
      parent: wpCat.parent || 0,
    };
  });

  // Determine page title from category path
  const pageTitle =
    categoryPath.length > 0
      ? decodeHtmlEntities(categoryPath[categoryPath.length - 1].name)
      : 'All Categories';

  // Only show full-page loading spinner on true initial load (no cached data)
  // Don't show spinner when navigating between cached categories
  const shouldShowFullPageSpinner =
    (isLoadingWPCategories && wpCategories.length === 0) ||
    (isLoadingSubcategories &&
      subcategories.length === 0 &&
      currentParentId > 0);

  if (shouldShowFullPageSpinner) {
    console.log('🔄 Showing full-page spinner (initial load):', {
      isLoadingWPCategories,
      isLoadingSubcategories,
      hasWPCategories: wpCategories.length > 0,
      hasSubcategories: subcategories.length > 0,
    });
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div
          className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"
          style={{ borderColor: '#650084', borderTopColor: 'transparent' }}
        ></div>
      </div>
    );
  }

  console.log('🎨 Rendering main content:', {
    showProducts,
    categoryProductsCount: categoryProducts.length,
  });

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <section className="relative px-5 pt-6 pb-4">
        <PageHeader
          title={pageTitle}
          onBack={
            !fromFavorites
              ? categoryPath.length > 0
                ? () => navigate(-1)
                : () => navigate('/')
              : undefined
          }
        />

        {/* Breadcrumb navigation - only show when not from favorites and has path */}
        {!fromFavorites && categoryPath.length > 0 && (
          <Breadcrumb categoryPath={categoryPath} className="mt-4 mb-2" />
        )}

        {showProducts ? (
          // PRODUCT VIEW
          <CategoryProductsView categorySlug={currentSlug || ''} />
        ) : (
          // CATEGORY VIEW
          <div className="mt-6">
            {(isLoadingSubcategories && currentParentId > 0) ||
              isLoadingFavoriteCategories ? (
              // Loading state for subcategories or favorites - inline skeleton
              <div className="space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-sm text-gray-600">Loading categories...</p>
                </div>
                <div className="grid grid-cols-2 min-[430px]:grid-cols-4 gap-3 sm:gap-4 md:gap-7.5">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="animate-pulse">
                      <div className="aspect-square bg-gray-200 rounded-[10px] mb-2"></div>
                      <div className="h-4 bg-gray-200 rounded w-3/4 mb-1"></div>
                      <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    </div>
                  ))}
                </div>
              </div>
            ) : categoryProducts.length > 0 ? (
              <Categories
                products={categoryProducts}
                selection={fromFavorites ? 'filter' : 'hierarchical'}
                onCategoryClick={handleCategoryClick}
                onHoverCategory={
                  fromFavorites ? undefined : handleCategoryHover
                }
              />
            ) : (
              <div className="flex justify-center items-center py-8">
                <p className="text-gray-500">
                  {categoryPath.length > 0
                    ? 'No subcategories available.'
                    : 'No categories available'}
                </p>
              </div>
            )}
          </div>
        )}
      </section>
    </PullToRefresh>
  );
};

export default AllCategories;
