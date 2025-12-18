import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import backButton from '@/assets/backButton.svg';
import heartIconReg from '@/assets/heartIconReg.svg';
import heartIcon from '@/assets/heartIcon.svg';
import {
  addFavorite,
  removeFavorite,
  listFavorites,
} from '@/services/favoriteService';
import { openExternalLink } from '@/utils/browserHelper';
import { getValidToken } from '@/lib/auth';
import { fetchProductById } from '@/services/productService';

// WPProduct type imported from categoryService for consistency

const ProductPage = () => {
  const { productId } = useParams();
  const navigate = useNavigate();
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoadingFavorite, setIsLoadingFavorite] = useState(false);

  // Fetch product details
  const {
    data: product,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['product', productId],
    queryFn: async () => fetchProductById(Number(productId)),
    enabled: !!productId,
  });

  // Check if product is in favorites
  useEffect(() => {
    const checkFavorite = async () => {
      try {
        const token = await getValidToken();
        if (!token || !productId) return;

        const resp = await listFavorites({ page: 1, limit: 200 });
        const isFav = resp.data.some(
          (fav) => fav.productId === Number(productId)
        );
        setIsFavorite(isFav);
      } catch (err) {
        console.error('Error checking favorite status:', err);
      }
    };

    checkFavorite();
  }, [productId]);

  // Handle favorite toggle
  const handleToggleFavorite = async () => {
    const token = await getValidToken();
    if (!token) {
      alert('Please sign in to manage favorites');
      return;
    }

    if (isLoadingFavorite || !productId) return;

    setIsLoadingFavorite(true);
    try {
      if (isFavorite) {
        await removeFavorite(Number(productId));
        setIsFavorite(false);
      } else {
        await addFavorite(Number(productId));
        setIsFavorite(true);
      }
    } catch (err) {
      console.error('Error toggling favorite:', err);
      alert('Failed to update favorites');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Get featured image
  const featuredImage =
    product?._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pb-6">
        <div className="px-5 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="rounded-[7px] p-2.5 bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
          >
            <img src={backButton} alt="Back" />
          </button>
        </div>
        <div className="px-5 mt-6">
          <div className="h-64 bg-white rounded-[14px] animate-pulse" />
          <div className="mt-6 h-8 bg-white rounded animate-pulse" />
          <div className="mt-4 h-24 bg-white rounded animate-pulse" />
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pb-6">
        <div className="px-5 pt-6">
          <button
            onClick={() => navigate(-1)}
            className="rounded-[7px] p-2.5 bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
          >
            <img src={backButton} alt="Back" />
          </button>
        </div>
        <div className="px-5 mt-6 text-center">
          <p className="text-gray-600">Product not found</p>
          <Button onClick={() => navigate(-1)} className="mt-4">
            Go Back
          </Button>
        </div>
      </div>
    );
  }

  const cleanHtml = (html: string) => {
    const temp = document.createElement('div');
    temp.innerHTML = html;
    return temp.textContent || temp.innerText || '';
  };

  const productTitle = product.title?.rendered ?? 'Product';
  const productDescription = cleanHtml(
    product.excerpt?.rendered ?? product.content?.rendered ?? ''
  );
  const buttonText = product.meta?.cta_button_text || 'Buy Now on Amazon';
  const buttonUrl = product.meta?.cta_button_url;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-6">
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 pt-6 pb-4 bg-[#f5f5f5]">
        <button
          onClick={() => navigate(-1)}
          className="rounded-[7px] p-2.5 bg-white shadow-[0_2px_4px_0_rgba(0,0,0,0.07)]"
        >
          <img src={backButton} alt="Back" />
        </button>
      </div>

      {/* Product Image */}
      {featuredImage && (
        <div className="px-5 mb-4">
          <img
            src={featuredImage}
            alt={productTitle}
            className="w-full h-64 object-cover rounded-[14px]"
          />
        </div>
      )}

      {/* Product Details */}
      <div className="px-5">
        {/* Title and Favorite Button */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <h1 className="font-roboto font-semibold text-[20px] text-black flex-1">
            {productTitle}
          </h1>
          <button
            onClick={handleToggleFavorite}
            disabled={isLoadingFavorite}
            className="w-8 h-8 shrink-0 bg-white p-2 rounded-[7px] shadow-[0_2px_4px_0_rgba(0,0,0,0.07)] transition-opacity hover:opacity-70 disabled:opacity-50"
          >
            <img
              src={isFavorite ? heartIcon : heartIconReg}
              alt={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
              className="w-full h-full"
            />
          </button>
        </div>

        {/* Description */}
        <div className="bg-white rounded-[14px] p-4 mb-4">
          <p className="font-roboto text-[14px] text-gray-700 leading-relaxed">
            {productDescription}
          </p>
        </div>

        {/* Product Link (WordPress) */}
        <div className="bg-white rounded-[14px] p-4 mb-6">
          <Button
            onClick={() => product.link && openExternalLink(product.link)}
            className="w-full bg-primary text-white font-semibold"
          >
            View Full Product
          </Button>
        </div>

        {/* Buy/CTA Button */}
        {buttonUrl && (
          <Button
            onClick={() => openExternalLink(buttonUrl)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            {buttonText}
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
