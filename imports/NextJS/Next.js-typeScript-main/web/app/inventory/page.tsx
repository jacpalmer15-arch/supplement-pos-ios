'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { InventoryRow } from '@/lib/types';
import { InventoryTable } from '@/components/inventory/inventory-table';

export default function InventoryPage() {
  const { data: all, isLoading: l1, isError: e1, error: er1 } = useQuery<InventoryRow[]>({
    queryKey: ['inventory'],
    queryFn: api.inventory.all,
  });

  const { data: low, isLoading: l2, isError: e2, error: er2 } = useQuery<InventoryRow[]>({
    queryKey: ['inventory-low'],
    queryFn: api.inventory.lowStock,
  });

  // Filter out low-stock items from "All Inventory" view
  const filteredAll = React.useMemo(() => {
    if (!all || !low) return all || [];
    const lowStockIds = new Set(low.map(item => item.clover_item_id));
    return all.filter(item => !lowStockIds.has(item.clover_item_id));
  }, [all, low]);

  return (
    <div className="p-6">
      <h1 className="text-xl font-semibold mb-6">Inventory</h1>

      <section className="mb-10">
        <h2 className="mb-4 text-lg font-medium">Low Stock</h2>
        {l2 && <p className="text-sm text-gray-500 mb-4">Loading…</p>}
        {e2 && <p className="text-sm text-red-600 mb-4">{String(er2)}</p>}
        <InventoryTable rows={Array.isArray(low) ? low : []} empty="No low-stock items." />
      </section>

      <section>
        <h2 className="mb-4 text-lg font-medium">All Inventory (Excluding Low Stock)</h2>
        {l1 && <p className="text-sm text-gray-500 mb-4">Loading…</p>}
        {e1 && <p className="text-sm text-red-600 mb-4">{String(er1)}</p>}
        <InventoryTable rows={filteredAll} empty="No regular inventory items." />
      </section>
    </div>
  );
}
