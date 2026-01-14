import type { Category } from '@/services/categoryService';
import { fetchSubCategories } from '@/services/categoryService';

/**
 * Build category path array from URL slug segments
 * @param slugs - Array of category slugs from URL (e.g., ['skincare', 'moisturizers'])
 * @param topLevelCategories - All top-level categories
 * @returns Promise resolving to array of Category objects in hierarchical order
 */
export const buildCategoryPath = async (
  slugs: string[],
  topLevelCategories: Category[]
): Promise<Category[]> => {
  if (slugs.length === 0) {
    return [];
  }

  const path: Category[] = [];
  let parentId = 0;

  for (const slug of slugs) {
    const candidates =
      parentId === 0 ? topLevelCategories : await fetchSubCategories(parentId);

    const match = candidates.find((c) => c.slug === slug);
    if (!match) {
      // Invalid slug in path, stop here
      break;
    }

    path.push(match);
    parentId = match.id;
  }

  return path;
};

/**
 * Parse URL path to extract category slugs
 * @param path - URL path (e.g., '/categories/skincare/moisturizers')
 * @returns Array of category slugs
 */
export const parseCategoryPath = (path: string): string[] => {
  // Remove leading/trailing slashes and split
  const segments = path.replace(/^\/|\/$/g, '').split('/');

  // Remove 'categories' prefix if present
  if (segments[0] === 'categories') {
    segments.shift();
  }

  // Filter out empty segments
  return segments.filter(Boolean);
};

/**
 * Get parent category path URL
 * @param currentPath - Current URL path
 * @returns Parent path URL or '/categories' if at top level
 */
export const getParentCategoryPath = (currentPath: string): string => {
  const slugs = parseCategoryPath(currentPath);

  if (slugs.length === 0) {
    return '/categories';
  }

  // Remove last segment to get parent
  slugs.pop();

  if (slugs.length === 0) {
    return '/categories';
  }

  return `/categories/${slugs.join('/')}`;
};

/**
 * Build URL path from category slugs
 * @param slugs - Array of category slugs
 * @returns URL path (e.g., '/categories/skincare/moisturizers')
 */
export const buildCategoryUrl = (slugs: string[]): string => {
  if (slugs.length === 0) {
    return '/categories';
  }

  return `/categories/${slugs.join('/')}`;
};
