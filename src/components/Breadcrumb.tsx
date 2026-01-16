import { ChevronRight, Home } from 'lucide-react';
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
      className={`flex items-center gap-1.5 text-sm overflow-x-auto scrollbar-hide py-2 ${className}`}
      aria-label="Breadcrumb"
    >
      {/* Home link */}
      <Link
        to="/categories"
        className="flex items-center gap-1 text-gray-500 hover:text-primary transition-colors whitespace-nowrap shrink-0"
      >
        <Home className="h-3.5 w-3.5" />
        <span className="hidden sm:inline">Categories</span>
      </Link>

      {/* Category path */}
      {categoryPath.map((category, index) => {
        const isLast = index === categoryPath.length - 1;
        const path = `/categories/${categoryPath
          .slice(0, index + 1)
          .map((c) => c.slug)
          .join('/')}`;

        return (
          <div key={category.id} className="flex items-center gap-1.5 shrink-0">
            <ChevronRight className="h-3.5 w-3.5 text-gray-300" />
            {isLast ? (
              <span className="text-primary font-medium whitespace-nowrap bg-primary/10 px-2.5 py-1 rounded-full text-xs">
                {decodeHtmlEntities(category.name)}
              </span>
            ) : (
              <Link
                to={path}
                className="text-gray-500 hover:text-primary transition-colors whitespace-nowrap text-xs"
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
