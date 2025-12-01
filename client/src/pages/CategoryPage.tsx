import { Products } from '@/components/Products';
import {
  fetchProductsByCategory,
  type Product,
} from '@/services/categoryService';
import { useEffect, useState } from 'react';
import profileSampleImage from '@/assets/profileImgSample.jpg';
import { useParams } from 'react-router-dom';

import { Button } from '@/components/ui/button';
import heartIconReg from '@/assets/heartIconReg.svg';

import OptionIcon from '@/assets/optionsIcon.svg';
import { Title } from '@/components/Title';

export default function CategoryPage() {
  const { categoryName } = useParams();
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Format category name for display (convert slug to title case)
  const displayCategoryName = categoryName
    ? categoryName
        .split('-')
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
    : '';

  const [currentProductIndex, setCurrentProductIndex] = useState(0);
  const [isImageFading, setIsImageFading] = useState(false);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);

  // Select 3 random products for featured section when products load
  useEffect(() => {
    if (products.length > 0) {
      const shuffled = [...products].sort(() => Math.random() - 0.5);
      setFeaturedProducts(shuffled.slice(0, Math.min(3, products.length)));
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
      }, 300); // Fade out duration
    }, 4000); // Change product every 4 seconds

    return () => clearInterval(interval);
  }, [featuredProducts.length]);

  useEffect(() => {
    const loadProductsBasedOnCategory = async () => {
      try {
        setIsLoadingProducts(true);
        const productsData = await fetchProductsByCategory(categoryName!);
        setProducts(productsData);
      } catch (error) {
        console.error('Failed to load products by category:', error);
      } finally {
        setIsLoadingProducts(false);
      }
    };
    if (categoryName) {
      loadProductsBasedOnCategory();
    }
  }, [categoryName]);

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
    <div>
      <Title title={displayCategoryName} />
      {isLoadingProducts ? (
        // Featured Products Loading Skeleton
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
                <button className="absolute top-2.5 right-3 bg-[rgba(255,255,255,0.3)] p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)] z-10">
                  <img src={heartIconReg} alt="" />
                </button>

                {/* Progress Indicator */}
                <div className="absolute bottom-2.5 left-1/2 transform -translate-x-1/2 flex gap-1 z-10">
                  {featuredProducts.map((_, index) => (
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

              <Button className="font-semibold text-[16px] text-white">
                {featuredProducts[currentProductIndex].meta.cta_button_text ||
                  'Add to Shopping'}
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
          <Products data={productsGridData} />
        ) : (
          <div className="flex justify-center items-center py-8">
            <p className="text-gray-500">No products available</p>
          </div>
        )}
      </section>
    </div>
  );
}
