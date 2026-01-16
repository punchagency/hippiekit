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
  const displayProducts = topCat ? products.slice(0, 6) : products;

  const handleDeselectClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onDeselectCategory?.();
  };

  const handleCategoryClickInternal = (category: (typeof products)[0]) => {
    if (selection === 'hierarchical' && onCategoryClick) {
      const hasSubcategories = true;
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

  // Horizontal scroll layout for top categories
  if (topCat) {
    return (
      <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-2 -mx-1 px-1">
        {displayProducts.map((category, index) => {
          const isSelected = categoryParam === category.slug;
          const hasSelection = categoryParam && categoryParam !== '';

          return (
            <div
              key={category.id}
              className={cn(
                'relative flex flex-col items-center shrink-0 cursor-pointer transition-all duration-300 fade-in-up group',
                isSelected ? 'scale-105' : hasSelection ? 'opacity-60' : 'opacity-100'
              )}
              style={{ animationDelay: `${index * 50}ms` }}
              onClick={() => handleCategoryClickInternal(category)}
              onMouseEnter={() => handleCategoryHover(category.id)}
            >
              {/* Card Container */}
              <div
                className={cn(
                  'relative w-[72px] h-[72px] rounded-2xl overflow-hidden shadow-md transition-all duration-300',
                  'group-hover:shadow-lg group-hover:scale-105',
                  isSelected && 'ring-2 ring-primary ring-offset-2'
                )}
              >
                {/* Image */}
                {category.image ? (
                  <img
                    src={category.image}
                    alt={category.name}
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                ) : (
                  <div className="w-full h-full bg-linear-to-br from-primary/20 to-primary/40 flex items-center justify-center">
                    <span className="text-primary font-bold text-lg">
                      {category.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}

                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-linear-to-t from-black/50 via-transparent to-transparent" />

                {/* Deselect Button */}
                {selection === 'filter' && isSelected && (
                  <button
                    onClick={handleDeselectClick}
                    className="absolute top-1 right-1 bg-white/90 backdrop-blur-sm rounded-full p-1 shadow-md hover:bg-white transition-colors z-10"
                    aria-label="Deselect category"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="10"
                      height="10"
                      viewBox="0 0 12 12"
                      fill="none"
                    >
                      <path
                        d="M9 3L3 9M3 3L9 9"
                        stroke="#650084"
                        strokeWidth="2"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      />
                    </svg>
                  </button>
                )}

                {/* Item Count Badge */}
                <div className="absolute bottom-1 right-1 bg-secondary/90 backdrop-blur-sm text-white text-[9px] font-semibold px-1.5 py-0.5 rounded-full">
                  {category.items}
                </div>
              </div>

              {/* Category Name */}
              <span className="mt-2 text-[11px] font-semibold text-center leading-tight line-clamp-2 w-[72px] text-gray-800">
                {category.name}
              </span>
            </div>
          );
        })}
      </div>
    );
  }

  // Grid layout for full categories page
  return (
    <div className="grid grid-cols-2 gap-4">
      {displayProducts.map((category, index) => (
        <div
          key={category.id}
          className="fade-in-up cursor-pointer group"
          style={{ animationDelay: `${index * 60}ms` }}
          onClick={() => handleCategoryClickInternal(category)}
          onMouseEnter={() => handleCategoryHover(category.id)}
        >
          {/* Card */}
          <div className="relative bg-white rounded-2xl overflow-hidden shadow-[0_4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 group-hover:shadow-[0_8px_30px_rgba(101,0,132,0.15)] group-hover:-translate-y-1">
            {/* Image Container */}
            <div className="relative h-32 w-full overflow-hidden">
              {category.image ? (
                <img
                  src={category.image}
                  alt={category.name}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                  onError={(e) => {
                    console.error('Failed to load image for', category.name);
                    e.currentTarget.style.display = 'none';
                  }}
                />
              ) : (
                <div className="w-full h-full bg-linear-to-br from-primary/10 via-primary/20 to-secondary/20 flex items-center justify-center">
                  <span className="text-primary/60 font-bold text-2xl">
                    {category.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-linear-to-t from-black/60 via-black/20 to-transparent" />

              {/* Category Name on Image */}
              <div className="absolute bottom-0 left-0 right-0 p-3">
                <h3 className="text-white font-semibold text-[15px] leading-tight line-clamp-2 drop-shadow-lg">
                  {category.name}
                </h3>
              </div>

              {/* Item Count Badge */}
              <div className="absolute top-2 right-2 bg-white/95 backdrop-blur-sm text-primary text-[11px] font-bold px-2.5 py-1 rounded-full shadow-sm">
                {category.items} items
              </div>

              {/* Hover Arrow Indicator */}
              <div className="absolute bottom-3 right-3 w-7 h-7 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
