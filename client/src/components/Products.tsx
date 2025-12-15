import { useEffect, useState } from 'react';
import { StarIcon } from '@/assets/icons';
import heartIconReg from '@/assets/heartIconReg.svg';
import heartIcon from '@/assets/heartIcon.svg';
import {
  addFavorite,
  removeFavorite,
  listFavorites,
} from '@/services/favoriteService';
import { getValidToken } from '@/lib/auth';

type Props = {
  data: {
    id: number;
    image: string;
    price: string;
    productName: string;
    description: string;
    rating: number;
  }[];
  horizontal?: boolean;
};

export const Products = ({ data, horizontal = false }: Props) => {
  const [favoriteIds, setFavoriteIds] = useState<Set<number>>(new Set());
  const [loadingIds, setLoadingIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    // Load user's favorites once to mark hearts
    (async () => {
      const token = await getValidToken();
      if (!token) return;
      try {
        const resp = await listFavorites({ page: 1, limit: 200 });
        const ids = new Set<number>(resp.data.map((f) => f.productId));
        setFavoriteIds(ids);
      } catch (e) {
        // non-fatal for rendering
        console.warn('Failed to load favorites list', e);
      }
    })();
  }, []);

  const handleToggle = async (productId: number) => {
    const token = await getValidToken();
    if (!token) {
      alert('Please sign in to manage favorites');
      return;
    }
    if (loadingIds.has(productId)) return;
    setLoadingIds((s) => new Set(s).add(productId));
    const isFav = favoriteIds.has(productId);
    // optimistic update
    setFavoriteIds((s) => {
      const next = new Set(s);
      if (isFav) next.delete(productId);
      else next.add(productId);
      return next;
    });
    try {
      if (isFav) await removeFavorite(productId);
      else await addFavorite(productId);
    } catch (e) {
      // rollback
      setFavoriteIds((s) => {
        const next = new Set(s);
        if (isFav) next.add(productId);
        else next.delete(productId);
        return next;
      });
    } finally {
      setLoadingIds((s) => {
        const next = new Set(s);
        next.delete(productId);
        return next;
      });
    }
  };

  return (
    <div
      className={
        horizontal
          ? 'flex gap-3 sm:gap-4 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1'
          : 'grid grid-cols-2 gap-3 sm:gap-4'
      }
    >
      {data.map((product) => {
        const { id, image, productName, description, rating } = product;

        return (
          <div
            key={id}
            className={`bg-white rounded-[13px] shadow-[0px_1px_10px_0px_rgba(0,0,0,0.16)] p-2 sm:p-2.5 flex flex-col gap-2 sm:gap-2.5 ${
              horizontal ? 'shrink-0 w-40 sm:w-[180px]' : ''
            }`}
          >
            {/* Product Image */}
            <div className="relative w-full h-[110px] sm:h-[127px] rounded-lg overflow-hidden">
              <img
                src={image}
                alt={productName}
                className="w-full h-full object-cover"
              />
              {/* Favorite Button */}
              <button
                className="absolute top-2 sm:top-2.5 right-2 sm:right-3 bg-[rgba(255,255,255,0.3)] p-1 sm:p-[5px] rounded-sm shadow-[0px_2px_16px_0px_rgba(6,51,54,0.1)] disabled:opacity-60"
                onClick={() => handleToggle(id)}
                disabled={loadingIds.has(id)}
                aria-pressed={favoriteIds.has(id)}
                aria-label={
                  favoriteIds.has(id)
                    ? 'Remove from favorites'
                    : 'Add to favorites'
                }
              >
                <img
                  src={favoriteIds.has(id) ? heartIcon : heartIconReg}
                  alt="Favorite"
                />
              </button>
            </div>

            {/* Product Info */}
            <div className="flex flex-col gap-2 sm:gap-3.5">
              {/* Product Name & Description */}
              <div className="flex flex-col gap-1.5 sm:gap-2.5">
                <h3 className="font-roboto font-semibold text-[14px] sm:text-[16px] text-black capitalize leading-tight sm:leading-normal line-clamp-1">
                  {productName}
                </h3>
                <p className="font-roboto font-normal text-[12px] sm:text-[14px] text-[#4e4e4e] leading-tight sm:leading-normal line-clamp-1">
                  {description}
                </p>
              </div>

              {/* Rating */}
              <div className="inline-flex">
                <div className="bg-[#eaeaea] rounded-[5px] px-1.5 sm:px-[7px] py-0.5 sm:py-[3px] flex items-center justify-center gap-[3px]">
                  <span className="font-roboto font-normal text-[11px] sm:text-[12px] text-black capitalize">
                    {rating}
                  </span>
                  <StarIcon />
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
