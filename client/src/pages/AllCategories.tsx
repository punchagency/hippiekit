import { Categories } from '@/components/Categories';
// import profileSampleImage from '@/assets/profileImgSample.jpg';
import logo from '@/assets/profileImgSample.jpg';
import { Title } from '@/components/Title';
import { useEffect, useState } from 'react';
import { fetchCategories, type Category } from '@/services/categoryService';
import { useNavigate, useSearchParams } from 'react-router-dom';

const AllCategories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const fromFavorites = searchParams.get('from') === 'favorites';

  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoadingCategories(true);
        const data = await fetchCategories();
        setCategories(data);
      } catch (error) {
        console.error('Failed to load categories:', error);
      } finally {
        setIsLoadingCategories(false);
      }
    };

    loadCategories();
  }, []);

  const handleCategoryClick = (categorySlug: string) => {
    if (fromFavorites) {
      // Navigate back to favorites with the selected category
      navigate(`/favorites?category=${categorySlug}`);
    }
    // Otherwise, default link behavior will navigate to category page
  };

  // Transform categories for the Categories component
  const categoryProducts = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    category: cat.name,
    price: '', // Not applicable for categories
    image: cat.meta.featured_image || logo, // Use featured image or fallback
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
