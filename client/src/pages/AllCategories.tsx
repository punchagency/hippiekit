import { Categories } from '@/components/Categories';
// import profileSampleImage from '@/assets/profileImgSample.jpg';
import logo from '@/assets/profileImgSample.jpg';
import { Title } from '@/components/Title';
import { useCategories } from '@/services/categoryService';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { listFavoriteCategories } from '@/services/favoriteService';
import { useState, useEffect } from 'react';

const AllCategories = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromFavorites = searchParams.get('from') === 'favorites';

  // Use cached query for regular categories
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

  const handleCategoryClick = (categorySlug: string) => {
    if (fromFavorites) {
      // Navigate back to favorites with the selected category
      navigate(`/favorites?category=${categorySlug}`);
    }
    // Otherwise, default link behavior will navigate to category page
  };

  // Use favorite categories when from favorites, otherwise use WP categories
  const categories = fromFavorites ? favoriteCategories : wpCategories;
  const isLoadingCategories = fromFavorites
    ? isLoadingFavoriteCategories
    : isLoadingWPCategories;

  // Transform categories for the Categories component
  const categoryProducts = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    category: cat.name,
    price: '', // Not applicable for categories
    image: fromFavorites
      ? (cat as any).image || logo
      : (cat as any).meta?.featured_image || logo,
    items: cat.count.toString(),
  }));

  // const categories = Array.from({ length: 12 }, (_, i) => ({
  //   id: i + 1,
  //   name: `Category ${i + 1}`,
  //   price: '$29.99',
  //   image: profileSampleImage,
  //   items: '50',
  // }));

  return (
    <section className="relative mx-[24.5px]">
      <Title title="All Categories" />

      <div className="mt-[37px]">
        {isLoadingCategories ? (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">Loading categories...</p>
          </div>
        ) : categoryProducts.length > 0 ? (
          <Categories
            products={categoryProducts}
            selection={fromFavorites ? 'filter' : 'link'}
            onCategoryClick={fromFavorites ? handleCategoryClick : undefined}
          />
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">No categories available</p>
          </div>
        )}
      </div>
    </section>
  );
};

export default AllCategories;
