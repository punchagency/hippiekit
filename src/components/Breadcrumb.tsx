import { ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Category } from '@/services/categoryService';
import { decodeHtmlEntities } from '@/utils/textHelpers';

interface BreadcrumbProps {
  categoryPath: Category[];
  className?: string;
}

export const Breadcrumb = ({
  categoryPath,
  className = '',
}: BreadcrumbProps) => {
  if (categoryPath.length === 0) {
    return null;
  }

  return (
    <nav
      className={`flex items-center gap-2 text-sm overflow-x-auto scrollbar-hide ${className}`}
      aria-label="Breadcrumb"
    >
      {/* Home link */}
      <Link
        to="/categories"
        className="text-gray-500 hover:text-primary transition-colors whitespace-nowrap"
      >
        Home
      </Link>

      {/* Category path */}
      {categoryPath.map((category, index) => {
        const isLast = index === categoryPath.length - 1;
        const path = `/categories/${categoryPath
          .slice(0, index + 1)
          .map((c) => c.slug)
          .join('/')}`;

        return (
          <div key={category.id} className="flex items-center gap-2">
            <ChevronRight className="h-4 w-4 text-gray-400" />
            {isLast ? (
              <span className="text-gray-900 font-medium whitespace-nowrap">
                {decodeHtmlEntities(category.name)}
              </span>
            ) : (
              <Link
                to={path}
                className="text-gray-500 hover:text-primary transition-colors whitespace-nowrap"
              >
                {decodeHtmlEntities(category.name)}
              </Link>
            )}
          </div>
        );
      })}
    </nav>
  );
};
