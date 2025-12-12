'use client';

import React, { useMemo, useState } from 'react';
import { InventoryRow } from '@/lib/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { AdjustInventoryDialog } from './adjust-inventory-dialog';
import { Edit, Search } from 'lucide-react';

interface InventoryTableProps {
  rows: InventoryRow[];
  empty: string;
  showFilter?: boolean;
}

export function InventoryTable({ rows, empty, showFilter = false }: InventoryTableProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [showLowStockOnly, setShowLowStockOnly] = useState(false);

  const filteredRows = useMemo(() => {
    let filtered = rows;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((row) =>
        (row.name?.toLowerCase().includes(searchTerm.toLowerCase())) ||
        row.clover_item_id.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply low stock filter
    if (showLowStockOnly) {
      filtered = filtered.filter((row) => {
        const reorderLevel = row.reorder_level ?? 0;
        return row.on_hand <= reorderLevel;
      });
    }

    return filtered;
  }, [rows, searchTerm, showLowStockOnly]);

  const isLowStock = (item: InventoryRow) => {
    const reorderLevel = item.reorder_level ?? 0;
    return item.on_hand <= reorderLevel;
  };

  return (
    <div className="space-y-4">
      {showFilter && (
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              type="text"
              placeholder="Search by name or item ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="low-stock-filter"
              checked={showLowStockOnly}
              onChange={(e) => setShowLowStockOnly(e.target.checked)}
              className="rounded border-gray-300"
            />
            <label htmlFor="low-stock-filter" className="text-sm font-medium">
              Show low stock only
            </label>
          </div>
        </div>
      )}

      <div className="overflow-x-auto">
        <table className="min-w-full text-left text-sm">
          <thead className="border-b bg-gray-50">
            <tr>
              <th className="px-3 py-2 font-medium">Name</th>
              <th className="px-3 py-2 font-medium">On Hand</th>
              <th className="px-3 py-2 font-medium">Reorder Level</th>
              <th className="px-3 py-2 font-medium">Status</th>
              <th className="px-3 py-2 font-medium">Clover Item</th>
              <th className="px-3 py-2 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredRows.map((row) => (
              <tr key={row.clover_item_id} className="border-b hover:bg-gray-50">
                <td className="px-3 py-2 font-medium">
                  {row.name ?? <span className="text-gray-500">-</span>}
                </td>
                <td className="px-3 py-2">
                  <span className={isLowStock(row) ? 'text-red-600 font-medium' : ''}>
                    {row.on_hand}
                  </span>
                </td>
                <td className="px-3 py-2">
                  {row.reorder_level ?? <span className="text-gray-500">-</span>}
                </td>
                <td className="px-3 py-2">
                  {isLowStock(row) ? (
                    <Badge variant="destructive">Low Stock</Badge>
                  ) : (
                    <Badge variant="secondary">In Stock</Badge>
                  )}
                </td>
                <td className="px-3 py-2 text-xs text-gray-600">
                  {row.clover_item_id}
                </td>
                <td className="px-3 py-2">
                  <AdjustInventoryDialog item={row}>
                    <Button variant="outline" size="sm">
                      <Edit className="h-3 w-3 mr-1" />
                      Adjust
                    </Button>
                  </AdjustInventoryDialog>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredRows.length === 0 && (
          <div className="p-8 text-center">
            <p className="text-sm text-gray-500">
              {searchTerm || showLowStockOnly ? 'No items match your filters.' : empty}
            </p>
          </div>
        )}
      </div>
      
      {showFilter && filteredRows.length > 0 && (
        <div className="text-sm text-gray-500">
          Showing {filteredRows.length} of {rows.length} items
        </div>
      )}
    </div>
  );
}