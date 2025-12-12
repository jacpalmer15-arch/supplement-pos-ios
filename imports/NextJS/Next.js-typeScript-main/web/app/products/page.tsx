'use client';

import { useMutation, useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { api } from '@/lib/api';
import { productColumns } from '@/components/products/columns';
import { EnhancedDataTable } from '@/components/products/enhanced-data-table';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/lib/supabase';

import type { ApiProduct, ProductTableRow } from '@/lib/types';

type CategoryVisibilityMap = Record<string, { total: number; visible: number }>;

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [kioskOnly, setKioskOnly] = useState(false);
  const [category, setCategory] = useState<string>('all');
  const [updatingCategoryId, setUpdatingCategoryId] = useState<string | null>(null);
  const [categoryVisibilityMessage, setCategoryVisibilityMessage] = useState('');
  const [categoryVisibilityError, setCategoryVisibilityError] = useState('');

  // Fetch categories
  const { data: categories = [], isLoading: isCatLoading, isError: isCatError, error: catError } = useQuery({
    queryKey: ['categories'],
    queryFn: api.categories.list,
  });

  const { data: categoryVisibility = {}, isLoading: isCategoryVisibilityLoading, refetch: refetchCategoryVisibility } = useQuery<CategoryVisibilityMap>({
    queryKey: ['category-visibility'],
    queryFn: async () => {
      const visibility = new Map<string, { total: number; visible: number }>();
      let offset = 0;
      const limit = 1000;
      let hasMore = true;

      while (hasMore) {
        const { data, error } = await supabase
          .from('products')
          .select('category_id, visible_in_kiosk')
          .range(offset, offset + limit - 1);

        if (error) {
          console.error('Error fetching category visibility:', error);
          throw error;
        }

        if (!data || data.length === 0) {
          break;
        }

        data.forEach((row) => {
          const key = row.category_id ?? 'uncategorized';
          if (!visibility.has(key)) {
            visibility.set(key, { total: 0, visible: 0 });
          }
          const entry = visibility.get(key)!;
          entry.total += 1;
          if (row.visible_in_kiosk) {
            entry.visible += 1;
          }
        });

        if (data.length < limit) {
          hasMore = false;
        } else {
          offset += limit;
        }
      }

      return Object.fromEntries(visibility);
    },
  });

  // Fetch products as ApiProduct[]
  const { data: rawProducts = [], isLoading, isError, error, refetch } = useQuery<ApiProduct[]>({
    queryKey: ['products', { search, kioskOnly, category }],
    queryFn: () =>
      api.products.list({
        search: search || undefined,
        kiosk_only: kioskOnly || undefined,
        category: category !== 'all' ? category : undefined,
      }),
  });

  const categoryVisibilityMutation = useMutation({
    mutationFn: ({ categoryId, visible }: { categoryId: string; visible: boolean }) =>
      api.products.setCategoryVisibility(categoryId, visible),
  });

  const handleCategoryToggle = async (categoryId: string, nextVisible: boolean, categoryName: string) => {
    setCategoryVisibilityMessage('');
    setCategoryVisibilityError('');
    setUpdatingCategoryId(categoryId);
    try {
      await categoryVisibilityMutation.mutateAsync({ categoryId, visible: nextVisible });
      await Promise.all([refetchCategoryVisibility(), refetch()]);
      setCategoryVisibilityMessage(
        nextVisible
          ? `${categoryName} items are now visible in the kiosk.`
          : `${categoryName} items are now hidden from the kiosk.`
      );
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to update category visibility.';
      setCategoryVisibilityError(message);
    } finally {
      setUpdatingCategoryId(null);
    }
  };

  // Map API data to table row shape
  const products: ProductTableRow[] = rawProducts.map((row) => ({
    clover_item_id: row.clover_item_id,
    name: row.name,
    category_id: row.category_id,
    category: categories.find((cat: { id: string; name: string }) => cat.id === row.category_id)?.name ?? '—', // <-- Use category for display name
    sku: row.sku,
    upc: row.upc,
    price_cents: typeof row.price_cents === 'number' ? row.price_cents : null,
    cost_cents: typeof row.cost_cents === 'number' ? row.cost_cents : null,
    visible_in_kiosk: row.visible_in_kiosk,
  }));

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Products</h1>

      <div className="grid gap-4 md:grid-cols-3 mb-6">
        <div>
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            placeholder="Name, SKU, UPC…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <div>
          <Label>Category</Label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger>
              <SelectValue placeholder="All categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              {categories.map((cat: { id: string; name: string }) => (
                <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <label className="mt-6 flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={kioskOnly}
            onChange={(e) => setKioskOnly(e.target.checked)}
          />
          Show kiosk-visible only
        </label>
      </div>

      <div className="mb-6 rounded-lg border bg-white p-4 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-medium">Category Kiosk Visibility</h2>
            <p className="text-xs text-gray-500">Toggle all products within a category on or off for the kiosk.</p>
          </div>
        </div>
        {categoryVisibilityMessage && (
          <p className="mb-2 text-sm text-green-600">{categoryVisibilityMessage}</p>
        )}
        {categoryVisibilityError && (
          <p className="mb-2 text-sm text-red-600">{categoryVisibilityError}</p>
        )}
        {isCatLoading || isCategoryVisibilityLoading ? (
          <p className="text-sm text-gray-500">Loading categories…</p>
        ) : (
          <div className="divide-y rounded-md border">
            {categories.map((cat: { id: string; name: string }) => {
              const stats = categoryVisibility[cat.id] ?? { total: 0, visible: 0 };
              const isVisible = stats.visible > 0;
              const isUpdating = updatingCategoryId === cat.id || categoryVisibilityMutation.isPending;

              return (
                <div key={cat.id} className="flex items-center justify-between p-3">
                  <div>
                    <p className="text-sm font-medium text-gray-900">{cat.name}</p>
                    <p className="text-xs text-gray-500">
                      {stats.visible} of {stats.total} items currently kiosk-visible
                    </p>
                  </div>
                  <button
                    onClick={() => handleCategoryToggle(cat.id, !isVisible, cat.name)}
                    disabled={isUpdating}
                    className={`rounded-md px-3 py-2 text-sm font-medium text-white transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${
                      isVisible ? 'bg-red-600 hover:bg-red-700' : 'bg-green-600 hover:bg-green-700'
                    }`}
                  >
                    {isUpdating
                      ? 'Updating…'
                      : isVisible
                        ? 'Hide in kiosk'
                        : 'Show in kiosk'}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        <button className="rounded-md border px-3 py-2 text-sm hover:bg-gray-50" onClick={() => refetch()}>
          Refresh
        </button>
      </div>

      {isLoading && <p className="text-sm text-gray-500">Loading…</p>}
      {isError && <p className="text-sm text-red-600">{(error as Error).message}</p>}
      {isCatError && <p className="text-sm text-red-600">{(catError as Error).message}</p>}
      {!isLoading && !isError && (
        <div>
          <EnhancedDataTable columns={productColumns} data={products} />
        </div>
      )}
    </div>
  );
}