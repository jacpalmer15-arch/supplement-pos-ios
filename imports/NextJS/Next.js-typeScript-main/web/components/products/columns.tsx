'use client';

import { ColumnDef } from '@tanstack/react-table';
import Link from 'next/link';
import { ProductTableRow } from '@/lib/types';
import { Switch } from '@/components/ui/switch';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { toast } from 'sonner';
import { formatCurrency } from '@/lib/utils';

function KioskToggle({ product }: { product: ProductTableRow }) {
  const qc = useQueryClient();
  const m = useMutation({
    mutationFn: (checked: boolean) =>
      api.products.update(product.clover_item_id, { visible_in_kiosk: checked }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products'] });
      toast.success('Updated');
    },
    onError: (e: Error) => toast.error(typeof e === 'string' ? e : 'Update failed'),
  });

  return (
    <Switch
      checked={!!product.visible_in_kiosk}
      onCheckedChange={(checked) => m.mutate(checked)}
      disabled={m.isPending}
    />
  );
}

export const productColumns: ColumnDef<ProductTableRow>[] = [
  {
    accessorKey: 'name',
    header: 'Name',
    cell: ({ row }) => (
      <Link
        href={`/products/${row.original.clover_item_id}`}
        className="text-blue-600 hover:underline"
      >
        {row.original.name}
      </Link>
    ),
  },
  { accessorKey: 'category', header: 'Category' },
  { accessorKey: 'upc', header: 'UPC' },
  { accessorKey: 'sku', header: 'SKU' },
  {
    accessorKey: 'price',
    header: 'Price',
    cell: ({ row }) =>
      row.original.price_cents != null ? formatCurrency(row.original.price_cents) : '—',
  },
  {
    accessorKey: 'cost',
    header: 'Cost',
    cell: ({ row }) =>
      row.original.cost_cents != null ? formatCurrency(row.original.cost_cents) : '—',
  },
  {
    id: 'kiosk',
    header: 'Kiosk',
    cell: ({ row }) => <KioskToggle product={row.original} />,
  },
];