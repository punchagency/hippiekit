const WP_API_URL =
  'https://dodgerblue-otter-660921.hostingersite.com/wp-json/wp/v2';

export interface Category {
  id: number;
  name: string;
  count: number;
  slug: string;
  description: string;
  link: string;
  meta: {
    featured_image: string;
    excerpt: string;
  };
}

export interface Product {
  id: number;
  title: {
    rendered: string;
  };
  content: {
    rendered: string;
  };
  featured_media: number;
  meta: {
    video_embed_url: string;
    cta_button_text: string;
    cta_button_url: string;
  };
  'product-categories': number[];
  _embedded?: {
    'wp:featuredmedia'?: Array<{
      source_url: string;
      alt_text: string;
    }>;
  };
}

export const fetchCategories = async (): Promise<Category[]> => {
  try {
    const response = await fetch(`${WP_API_URL}/product-categories/`);

    if (!response.ok) {
      throw new Error('Failed to fetch categories');
    }

    const data = await response.json();

    // Fetch featured images for categories that have them
    const categoriesWithImages = await Promise.all(
      data.map(async (category: Category) => {
        if (category.meta.featured_image) {
          try {
            const mediaResponse = await fetch(
              `${WP_API_URL}/media/${category.meta.featured_image}`
            );
            if (mediaResponse.ok) {
              const mediaData = await mediaResponse.json();
              return {
                ...category,
                meta: {
                  ...category.meta,
                  featured_image:
                    mediaData.source_url || category.meta.featured_image,
                },
              };
            }
          } catch {
            console.error('Failed to fetch media for category:', category.id);
          }
        }
        return category;
      })
    );

    return categoriesWithImages;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

export const fetchProducts = async (
  perPage: number = 10
): Promise<Product[]> => {
  try {
    const response = await fetch(
      `${WP_API_URL}/products?per_page=${perPage}&_embed`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductsPaginated = async (
  page: number = 1,
  perPage: number = 15,
  categorySlug?: string
): Promise<Product[]> => {
  try {
    let url = `${WP_API_URL}/products?page=${page}&per_page=${perPage}&_embed`;

    // If category slug is provided, fetch by category
    if (categorySlug) {
      const categoryResponse = await fetch(
        `${WP_API_URL}/product-categories?slug=${categorySlug}`
      );

      if (!categoryResponse.ok) {
        throw new Error('Failed to fetch category');
      }

      const categories = await categoryResponse.json();

      if (!categories || categories.length === 0) {
        return [];
      }

      const categoryId = categories[0].id;
      url = `${WP_API_URL}/products?page=${page}&per_page=${perPage}&product-categories=${categoryId}&_embed`;
    }

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error('Failed to fetch products');
    }

    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

export const fetchProductsByCategory = async (
  categorySlug: string
): Promise<Product[]> => {
  try {
    if (!categorySlug) {
      return [];
    }

    // First, fetch the category to get its ID
    const categoryResponse = await fetch(
      `${WP_API_URL}/product-categories?slug=${categorySlug}`
    );

    if (!categoryResponse.ok) {
      throw new Error('Failed to fetch category');
    }

    const categories = await categoryResponse.json();

    if (!categories || categories.length === 0) {
      return [];
    }

    const categoryId = categories[0].id;

    // Then fetch products by category ID
    const productsResponse = await fetch(
      `${WP_API_URL}/products?product-categories=${categoryId}&_embed`
    );

    if (!productsResponse.ok) {
      throw new Error('Failed to fetch products by category');
    }

    const data = await productsResponse.json();
    return data;
  } catch (error) {
    console.error('Error fetching products by category:', error);
    throw error;
  }
};

export const searchCategoriesAndProducts = async (
  searchTerm: string,
  categorySlug?: string
): Promise<{ categories: Category[]; products: Product[] }> => {
  try {
    if (!searchTerm || searchTerm.trim() === '') {
      return { categories: [], products: [] };
    }

    let productUrl = `${WP_API_URL}/products?search=${encodeURIComponent(
      searchTerm
    )}&per_page=15&_embed`;

    // If searching within a category, get category ID first
    if (categorySlug) {
      const categoryResponse = await fetch(
        `${WP_API_URL}/product-categories?slug=${categorySlug}`
      );

      if (categoryResponse.ok) {
        const categories = await categoryResponse.json();
        if (categories && categories.length > 0) {
          const categoryId = categories[0].id;
          productUrl = `${WP_API_URL}/products?search=${encodeURIComponent(
            searchTerm
          )}&product-categories=${categoryId}&per_page=15&_embed`;
        }
      }
    }

    // Search categories and products in parallel
    const [categoriesResponse, productsResponse] = await Promise.all([
      fetch(
        `${WP_API_URL}/product-categories?search=${encodeURIComponent(
          searchTerm
        )}`
      ),
      fetch(productUrl),
    ]);

    if (!categoriesResponse.ok || !productsResponse.ok) {
      throw new Error('Failed to search');
    }

    const [categoriesData, productsData] = await Promise.all([
      categoriesResponse.json(),
      productsResponse.json(),
    ]);

    // Fetch featured images for categories
    const categoriesWithImages = await Promise.all(
      categoriesData.map(async (category: Category) => {
        if (category.meta.featured_image) {
          try {
            const mediaResponse = await fetch(
              `${WP_API_URL}/media/${category.meta.featured_image}`
            );
            if (mediaResponse.ok) {
              const mediaData = await mediaResponse.json();
              return {
                ...category,
                meta: {
                  ...category.meta,
                  featured_image:
                    mediaData.source_url || category.meta.featured_image,
                },
              };
            }
          } catch {
            console.error('Failed to fetch media for category:', category.id);
          }
        }
        return category;
      })
    );

    return {
      categories: categoriesWithImages,
      products: productsData,
    };
  } catch (error) {
    console.error('Error searching:', error);
    throw error;
  }
};
