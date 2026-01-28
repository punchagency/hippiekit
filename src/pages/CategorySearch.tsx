import { CategoryProductsView } from '@/components/CategoryProductsView';
import { useParams, useNavigate } from 'react-router-dom';
import { PullToRefresh } from '@/components/PullToRefresh';
import { PageHeader } from '@/components/PageHeader';
import { useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo } from 'react';

export default function CategorySearch() {
  const { categorySlug } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const pageTitle = useMemo(() => {
    const raw = decodeURIComponent(categorySlug || '');
    if (!raw) return 'Category';
    return raw.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  }, [categorySlug]);

  // Refresh handler
  const handleRefresh = useCallback(async () => {
    await queryClient.invalidateQueries({
      queryKey: ['products-by-category', categorySlug],
    });
  }, [queryClient, categorySlug]);

  return (
    <PullToRefresh onRefresh={handleRefresh}>
      <div className="min-h-screen bg-[#F5F5F5] relative px-5">
        <PageHeader title={pageTitle} onBack={() => navigate(-1)} />
        {/* Use CategoryProductsView which handles everything */}
        <CategoryProductsView categorySlug={categorySlug || ''} />
      </div>
    </PullToRefresh>
  );
}
