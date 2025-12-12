'use client';

import * as React from 'react';
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getSortedRowModel,
  getPaginationRowModel,
  SortingState,
  useReactTable,
} from '@tanstack/react-table';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Product } from '@/lib/types';
import { ProductDetailsModal } from './details-modal';
import { Eye } from 'lucide-react';

export function EnhancedDataTable<TData extends Product, TValue>({
  columns,
  data,
}: {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
}) {
  const [sorting, setSorting] = React.useState<SortingState>([]);
  const [selectedProductId, setSelectedProductId] = React.useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = React.useState(false);

  // Add a details column
  const columnsWithDetails: ColumnDef<TData, TValue>[] = [
    ...columns,
    {
      id: 'details',
      header: '',
      cell: ({ row }) => (
        <button
          onClick={() => {
            setSelectedProductId(row.original.clover_item_id);
            setIsModalOpen(true);
          }}
          className="p-1 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded transition-colors"
          title="View details"
        >
          <Eye size={16} />
        </button>
      ),
    } as ColumnDef<TData, TValue>,
  ];

  const table = useReactTable({
    data,
    columns: columnsWithDetails,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    initialState: { pagination: { pageIndex: 0, pageSize: 25 } },
  });

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedProductId(null);
  };

  return (
    <>
      <div className="space-y-3">
        <div className="overflow-x-auto rounded-md border">
          <Table>
            <TableHeader className="bg-gray-50">
              {table.getHeaderGroups().map(hg => (
                <TableRow key={hg.id}>
                  {hg.headers.map(header => (
                    <TableHead
                      key={header.id}
                      onClick={header.id !== 'details' ? header.column.getToggleSortingHandler() : undefined}
                      className={header.id !== 'details' ? "cursor-pointer select-none" : "w-12"}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {header.id !== 'details' && 
                        ({ asc: ' ▲', desc: ' ▼' }[header.column.getIsSorted() as string] ?? null)
                      }
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows.map(row => (
                <TableRow key={row.id} className="hover:bg-gray-50">
                  {row.getVisibleCells().map(cell => (
                    <TableCell key={cell.id}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <span>
              Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
            </span>
            <div className="flex items-center gap-2">
              <label htmlFor="page-size" className="text-sm">Show:</label>
              <select
                id="page-size"
                value={table.getState().pagination.pageSize}
                onChange={(e) => table.setPageSize(Number(e.target.value))}
                className="rounded border px-2 py-1 text-sm"
              >
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              className="rounded border px-3 py-1 disabled:opacity-50 text-sm"
              onClick={() => table.setPageIndex(0)}
              disabled={!table.getCanPreviousPage()}
            >
              First
            </button>
            <button
              className="rounded border px-2 py-1 disabled:opacity-50 text-sm"
              onClick={() => table.previousPage()}
              disabled={!table.getCanPreviousPage()}
            >
              Prev
            </button>
            <button
              className="rounded border px-2 py-1 disabled:opacity-50 text-sm"
              onClick={() => table.nextPage()}
              disabled={!table.getCanNextPage()}
            >
              Next
            </button>
            <button
              className="rounded border px-3 py-1 disabled:opacity-50 text-sm"
              onClick={() => table.setPageIndex(table.getPageCount() - 1)}
              disabled={!table.getCanNextPage()}
            >
              Last
            </button>
          </div>
        </div>
      </div>

      <ProductDetailsModal
        productId={selectedProductId}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
}