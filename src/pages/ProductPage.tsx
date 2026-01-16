import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
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
import { toast } from '@/lib/toast.tsx';
import { decodeHtmlEntities } from '@/utils/textHelpers';
import { PageHeader } from '@/components/PageHeader';

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
      toast.warning('Please sign in to manage favorites');
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
      toast.error('Failed to update favorites');
    } finally {
      setIsLoadingFavorite(false);
    }
  };

  // Get featured image
  const featuredImage =
    product?._embedded?.['wp:featuredmedia']?.[0]?.source_url;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#f5f5f5] pb-6 ">
        <div className="px-5 pt-6">
          <PageHeader title="Product" onBack={() => navigate(-1)} />
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
      <div className="min-h-screen bg-[#f5f5f5] pb-6 ">
        <div className="px-5 pt-6">
          <PageHeader title="Product" onBack={() => navigate(-1)} />
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

  const productTitle = decodeHtmlEntities(product.title?.rendered ?? 'Product');
  const productDescriptionHtml =
    product.excerpt?.rendered ?? product.content?.rendered ?? '';
  const buttonUrl = product.meta?.cta_button_url;

  return (
    <div className="min-h-screen bg-[#f5f5f5] pb-6 ">
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 pt-6 pb-4 bg-[#f5f5f5]">
        <PageHeader title={productTitle} onBack={() => navigate(-1)} />
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
          <div
            className="font-roboto text-[14px] text-gray-700 leading-relaxed [&_p]:space-y-3 [&_br]:block [&_br]:my-3"
            dangerouslySetInnerHTML={{ __html: productDescriptionHtml }}
            style={{
              lineHeight: '1.8',
            }}
          />
        </div>

        {/* Product Link (WordPress) */}
        {/* <div className="bg-white rounded-[14px] p-4 mb-6">
          <Button
            onClick={() => product.link && openExternalLink(product.link)}
            className="w-full bg-primary text-white font-semibold"
          >
            View Full Product
          </Button>
        </div> */}

        {/* Buy/CTA Button */}
        {buttonUrl && (
          <Button
            onClick={() => openExternalLink(buttonUrl)}
            className="w-full bg-green-600 hover:bg-green-700 text-white font-semibold"
          >
            Buy Now
          </Button>
        )}
      </div>
    </div>
  );
};

export default ProductPage;
