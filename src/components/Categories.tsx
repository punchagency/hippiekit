import { cn } from '@/lib/utils';
import { useNavigate } from 'react-router-dom';

type Props = {
  topCat?: boolean;
  products: {
    id: number;
    name: string;
    price: string;
    image: string;
    items: string;
    slug: string;
    parent?: number;
  }[];
  onCategoryClick?: (
    categoryId: number,
    categorySlug: string,
    hasSubcategories?: boolean
  ) => void;
  onHoverCategory?: (categoryId: number) => void;
  onDeselectCategory?: () => void;
  categoryParam?: string;
  selection?: 'link' | 'filter' | 'hierarchical';
};

export const Categories = ({
  products,
  topCat,
  onCategoryClick,
  onHoverCategory,
  onDeselectCategory,
  categoryParam,
  selection,
}: Props) => {
  const navigate = useNavigate();

  const handleCategoryLink = (slug: string) => {
    navigate(`/categories/${slug}`);
  };
  const displayProducts = topCat ? products.slice(0, 4) : products;

  const handleDeselectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeselectCategory?.();
  };

  const handleCategoryClickInternal = (category: (typeof products)[0]) => {
    if (selection === 'hierarchical' && onCategoryClick) {
      // For hierarchical mode, pass category info to parent to determine if it has subcategories
      // The parent will check if subcategories exist and handle navigation accordingly
      const hasSubcategories = true; // Will be checked by parent component
      onCategoryClick(category.id, category.slug, hasSubcategories);
    } else if (selection === 'link') {
      handleCategoryLink(category.slug);
    } else if (onCategoryClick) {
      onCategoryClick(category.id, category.slug, false);
    }
  };

  const handleCategoryHover = (categoryId: number) => {
    onHoverCategory?.(categoryId);
  };

  return (
    <div
      className={cn(
        topCat
          ? 'flex gap-5 sm:gap-4'
          : 'grid grid-cols-2 min-[430px]:grid-cols-4 gap-3 sm:gap-4 md:gap-7.5 justify-items-center'
      )}
    >
      {displayProducts.map((category, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col items-center opacity-100 gap-1 sm:gap-1.5 md:gap-2 font-family-Inter fade-in-up cursor-pointer',
            topCat
              ? 'shrink-0 w-20 sm:w-24'
              : 'w-full max-w-[80px] min-[430px]:max-w-[60px]',
            {
              'opacity-50':
                topCat &&
                selection === 'filter' &&
                categoryParam !== category.slug,
            },
            {
              'opacity-100': topCat && categoryParam == '',
            }
          )}
          style={{ animationDelay: `${index * 60}ms` }}
          onClick={() => handleCategoryClickInternal(category)}
          onMouseEnter={() => handleCategoryHover(category.id)}
        >
          <div
            className={cn(
              'w-full aspect-square rounded-[10px] overflow-hidden relative',
              !topCat && 'max-w-[80px] sm:max-w-[60px]'
            )}
          >
            {category.image ? (
              <img
                src={category.image}
                alt={category.name}
                className="w-full h-full object-cover"
                onError={(e) => {
                  console.error(
                    'Failed to load image for',
                    category.name,
                    category.image
                  );
                  e.currentTarget.style.display = 'none';
                }}
              />
            ) : (
              <div className="w-full h-full bg-gray-200 flex items-center justify-center text-xs text-gray-500">
                {category.name.substring(0, 2).toUpperCase()}
              </div>
            )}
            {selection === 'filter' && categoryParam === category.slug && (
              <button
                onClick={handleDeselectClick}
                className="absolute top-1 right-1 bg-white rounded-full p-0.5 shadow-md hover:bg-gray-100 transition-colors"
                aria-label="Deselect category"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                >
                  <path
                    d="M9 3L3 9M3 3L9 9"
                    stroke="#1D1D21"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
          <span className="text-[11px] sm:text-[14px] md:text-[16px] font-semibold line-clamp-2 text-center leading-tight w-full">
            {category.name}
          </span>
          <span className="text-[9px] sm:text-[11px] md:text-[13px] font-normal text-[#1D1D21]">
            {category.items} Items
          </span>
        </div>
      ))}
    </div>
  );
};
