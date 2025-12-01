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
  }[];
  onCategoryClick?: (categoryName: string) => void;
  onDeselectCategory?: () => void;
  categoryParam?: string;
  selection?: 'link' | 'filter';
};

export const Categories = ({
  products,
  topCat,
  onCategoryClick,
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

  return (
    <div className="grid grid-cols-4 gap-4 sm:gap-7.5 justify-items-center">
      {displayProducts.map((category, index) => (
        <div
          key={index}
          className={cn(
            'flex flex-col items-center opacity-100 gap-1.5 sm:gap-2 w-[55px] sm:w-[60px] font-family-Inter',
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
          onClick={
            selection === 'link'
              ? () => handleCategoryLink(category.slug)
              : () => onCategoryClick?.(category.slug)
          }
        >
          <div className="w-[55px] h-[55px] sm:w-[60px] sm:h-[60px] rounded-[10px] overflow-hidden relative">
            <img
              src={category.image}
              alt={category.name}
              className="w-full h-full object-cover"
            />
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
          <span className="text-[14px] sm:text-[16px] font-semibold line-clamp-2 text-center leading-tight sm:leading-4">
            {category.name}
          </span>
          <span className="text-[11px] sm:text-[13px] font-normal text-[#1D1D21]">
            {category.items} Items
          </span>
        </div>
      ))}
    </div>
  );
};
