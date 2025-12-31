import { Categories } from '@/components/Categories';
// import profileSampleImage from '@/assets/profileImgSample.jpg';
import logo from '@/assets/profileImgSample.jpg';
import { PageHeader } from '@/components/PageHeader';
import { useCategories, fetchSubCategories } from '@/services/categoryService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listFavoriteCategories } from '@/services/favoriteService';
import { useState, useEffect } from 'react';
import type { Category } from '@/services/categoryService';
import { decodeHtmlEntities } from '@/utils/textHelpers';
import { useCategory } from '@/context/CategoryContext';

const AllCategories = () => {
  const navigate = useNavigate();
  const { setSelectedCategory } = useCategory();
  const [searchParams] = useSearchParams();
  const fromFavorites = searchParams.get('from') === 'favorites';

  // State for hierarchical navigation
  const [selectedParentCategory, setSelectedParentCategory] =
    useState<Category | null>(null);
  const [currentCategories, setCurrentCategories] = useState<Category[]>([]);

  // Use cached query for regular categories (top-level only)
  const { data: wpCategories = [], isLoading: isLoadingWPCategories } =
    useCategories();

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
  const [isLoadingSubcategories, setIsLoadingSubcategories] = useState(false);

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

  // Set current categories when WP categories load
  useEffect(() => {
    if (!fromFavorites && wpCategories.length > 0 && !selectedParentCategory) {
      setCurrentCategories(wpCategories);
    }
  }, [wpCategories, fromFavorites, selectedParentCategory]);

  const handleCategoryClick = async (
    categoryId: number,
    categorySlug: string
  ) => {
    if (fromFavorites) {
      // Navigate back to favorites with the selected category
      navigate(`/favorites?category=${categorySlug}`);
      return;
    }

    // Check if this category has subcategories
    try {
      setIsLoadingSubcategories(true);
      const subcategories = await fetchSubCategories(categoryId);

      // Filter to ensure we only get direct children of this category
      const scopedSubcategories = (subcategories || []).filter(
        (cat) => cat.parent === categoryId
      );

      if (scopedSubcategories.length > 0) {
        // Category has subcategories, show them
        const parentCategory = currentCategories.find(
          (cat) => cat.id === categoryId
        );
        if (parentCategory) {
          setSelectedParentCategory(parentCategory);
          setCurrentCategories(scopedSubcategories);
        }
      } else {
        // No subcategories, navigate to category products page
        const selectedCat = currentCategories.find(
          (cat) => cat.id === categoryId
        );
        if (selectedCat) {
          setSelectedCategory(selectedCat);
        }
        navigate(`/categories/${categorySlug}`);
      }
    } catch (error) {
      console.error('Error fetching subcategories:', error);
      // On error, navigate to category page
      navigate(`/categories/${categorySlug}`);
    } finally {
      setIsLoadingSubcategories(false);
    }
  };

  const handleBackToParent = () => {
    setSelectedParentCategory(null);
    setCurrentCategories(wpCategories);
  };

  // Use favorite categories when from favorites, otherwise use current categories (may be top-level or subcategories)
  const categories = fromFavorites ? favoriteCategories : currentCategories;
  const isLoadingCategories = fromFavorites
    ? isLoadingFavoriteCategories
    : isLoadingWPCategories || isLoadingSubcategories;

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

  // const categories = Array.from({ length: 12 }, (_, i) => ({
  //   id: i + 1,
  //   name: `Category ${i + 1}`,
  //   price: '$29.99',
  //   image: profileSampleImage,
  //   items: '50',
  // }));

  return (
    <section className="relative px-5 pt-6 pb-4">
      <PageHeader
        title={
          selectedParentCategory
            ? selectedParentCategory.name
            : 'All Categories'
        }
        onBack={
          selectedParentCategory && !fromFavorites
            ? handleBackToParent
            : undefined
        }
      />

      <div className="mt-6">
        {isLoadingCategories ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : categoryProducts.length > 0 ? (
          <Categories
            products={categoryProducts}
            selection={fromFavorites ? 'filter' : 'hierarchical'}
            onCategoryClick={handleCategoryClick}
          />
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">
              {selectedParentCategory
                ? 'No subcategories available. Click a category to view products.'
                : 'No categories available'}
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllCategories;
