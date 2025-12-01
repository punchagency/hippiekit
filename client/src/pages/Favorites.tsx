import favoritesIcon from '@/assets/favoritesIcon.svg';
import { SearchIcon } from '@/assets/homeIcons';
import { Categories } from '@/components/Categories';
import profileSampleImage from '@/assets/profileImgSample.jpg';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import productGridImage from '@/assets/productGridImage.png';

import {
  fetchCategories,
  fetchProductsPaginated,
  searchCategoriesAndProducts,
  type Product,
  type Category,
} from '@/services/categoryService';
import ProductInfo from '@/components/ProductInfo';
const Favorites = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const navigate = useNavigate();
  const observerTarget = useRef<HTMLDivElement>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  const categoryParam: string = searchParams.get('category') || '';
  const searchParam: string = searchParams.get('search') || '';

  // Initialize search query from URL on mount
  useEffect(() => {
    setSearchQuery(searchParam);
  }, [searchParam]);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const categoriesData = await fetchCategories();
        setCategories(categoriesData);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };
    loadCategories();
  }, []);

  // Debounced search effect
  useEffect(() => {
    // Clear existing timeout
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    // If search query is empty and no category selected, reset to initial state
    if (!searchQuery.trim() && !categoryParam) {
      return;
    }

    // Set debounce timeout for search
    if (searchQuery.trim()) {
      searchTimeoutRef.current = setTimeout(async () => {
        try {
          setIsLoadingProducts(true);

          const results = await searchCategoriesAndProducts(
            searchQuery.trim(),
            categoryParam || undefined
          );
          // Only update products, keep categories as is
          setProducts(results.products);
          setHasMore(false); // Disable infinite scroll for search results
        } catch (error) {
          console.error('Search failed:', error);
        } finally {
          setIsLoadingProducts(false);
        }
      }, 500); // 500ms debounce delay
    }

    // Cleanup function
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery, categoryParam]);

  const handleCategoryClick = (categoryName: string) => {
    const newParams: Record<string, string> = { category: categoryName };
    if (searchQuery.trim()) newParams.search = searchQuery.trim();
    setSearchParams(newParams);
  };

  // Handle category deselection
  const handleDeselectCategory = () => {
    const newParams: Record<string, string> = {};
    if (searchQuery.trim()) newParams.search = searchQuery.trim();
    setSearchParams(newParams);
  };

  // Load products function
  const loadProducts = useCallback(
    async (pageNum: number, categorySlug: string, reset: boolean = false) => {
      try {
        if (reset) {
          setIsLoadingProducts(true);
        } else {
          setIsLoadingMore(true);
        }

        const productsData = await fetchProductsPaginated(
          pageNum,
          15,
          categorySlug || undefined
        );

        if (productsData.length < 15) {
          setHasMore(false);
        }

        setProducts((prev) =>
          reset ? productsData : [...prev, ...productsData]
        );
      } catch (error) {
        console.error('Failed to load products:', error);
      } finally {
        setIsLoadingProducts(false);
        setIsLoadingMore(false);
      }
    },
    []
  );

  // Load initial products when category changes or on mount
  useEffect(() => {
    setProducts([]);
    setPage(1);
    setHasMore(true);
    loadProducts(1, categoryParam, true);
  }, [categoryParam, loadProducts]);

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
          loadProducts(nextPage, categoryParam, false);
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
  }, [
    hasMore,
    isLoadingMore,
    isLoadingProducts,
    page,
    categoryParam,
    loadProducts,
  ]);

  // Transform categories for the Categories component
  const categoryProducts = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    price: '', // Not applicable for categories
    image: cat.meta.featured_image || productGridImage, // Use featured image or fallback
    items: cat.count.toString(),
  }));

  // Reorder categories to show selected category first
  const reorderedCategories = categoryParam
    ? [
        ...categoryProducts.filter((cat) => cat.slug === categoryParam),
        ...categoryProducts.filter((cat) => cat.slug !== categoryParam),
      ]
    : categoryProducts;

  // Helper function to strip HTML tags
  const stripHtml = (html: string) => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    return tmp.textContent || tmp.innerText || '';
  };

  // Transform products for the Products component
  const productsGridData = products.map((product) => ({
    id: product.id,
    image:
      product._embedded?.['wp:featuredmedia']?.[0]?.source_url ||
      profileSampleImage,
    price: product.meta.cta_button_text || 'View Product',
    productName: product.title.rendered,
    description: stripHtml(product.content.rendered).substring(0, 100),
    rating: 4.5, // WordPress doesn't provide ratings by default
  }));

  return (
    <header className="px-5 pt-6 pb-4">
      <div className="flex items-center justify-center mb-4">
        <div className="mt-10 flex p-2.5 items-center gap-[7px] ">
          <img src={favoritesIcon} alt="Logo" className="" />
          <span className="font-family-segoe text-primary text-[18px] font-bold">
            Favorites
          </span>
        </div>
      </div>

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

      {/* Scan Button */}
      <section className=" rounded-[7px] px-4 py-5 bg-[#FFF] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] flex flex-col gap-7.5 ">
        <div className="flex justify-between">
          <h2 className="text-primary font-family-segoe text-[18px] font-bold capitalize">
            Top Categories
          </h2>

          <button
            className="text-[#848484] underline text-sm sm:text-base"
            onClick={() => navigate('/all-categories?from=favorites')}
          >
            See all
          </button>
        </div>

        {isLoadingCategories ? (
          <div className="grid grid-cols-4 gap-4 sm:gap-7.5 justify-items-center">
            {[...Array(4)].map((_, index) => (
              <div
                key={index}
                className="flex flex-col items-center gap-1.5 sm:gap-2 w-[55px] sm:w-[60px]"
              >
                <div className="w-[55px] h-[55px] sm:w-[60px] sm:h-[60px] rounded-[10px] bg-[#650084]/10 animate-pulse" />
                <div className="h-4 w-full bg-[#650084]/10 rounded animate-pulse" />
                <div className="h-3 w-3/4 bg-[#650084]/10 rounded animate-pulse" />
              </div>
            ))}
          </div>
        ) : categoryProducts.length > 0 ? (
          <Categories
            topCat
            categoryParam={categoryParam}
            onCategoryClick={handleCategoryClick}
            onDeselectCategory={handleDeselectCategory}
            products={reorderedCategories}
            selection="filter"
          />
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
                <div className="w-[60px] h-[60px] rounded-lg bg-[#650084]/10 animate-pulse" />

                {/* Content skeleton */}
                <div className="flex flex-col flex-1 gap-2">
                  <div className="h-4 w-3/4 bg-[#650084]/10 rounded animate-pulse" />
                  <div className="h-3 w-full bg-[#650084]/10 rounded animate-pulse" />
                  <div className="h-3 w-5/6 bg-[#650084]/10 rounded animate-pulse" />
                </div>

                {/* Heart icon skeleton */}
                <div className="w-[22px] h-[22px] bg-[#650084]/10 rounded-sm animate-pulse" />
              </div>
            ))}
          </>
        ) : productsGridData.length > 0 ? (
          <>
            {productsGridData.map((product, index) => (
              <div
                key={`${product.id}-${index}`}
                className="flex flex-col gap-2.5 "
              >
                <ProductInfo
                  name={product.productName}
                  description={product.description}
                  img={product.image}
                />
              </div>
            ))}

            {/* Infinite scroll trigger */}
            <div
              ref={observerTarget}
              className="h-10 flex items-center justify-center"
            >
              {isLoadingMore && (
                <div className="w-full bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2.5 flex gap-3">
                  <div className="w-[60px] h-[60px] rounded-lg bg-[#650084]/10 animate-pulse" />
                  <div className="flex flex-col flex-1 gap-2">
                    <div className="h-4 w-3/4 bg-[#650084]/10 rounded animate-pulse" />
                    <div className="h-3 w-full bg-[#650084]/10 rounded animate-pulse" />
                  </div>
                  <div className="w-[22px] h-[22px] bg-[#650084]/10 rounded-sm animate-pulse" />
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
  );
};

export default Favorites;
