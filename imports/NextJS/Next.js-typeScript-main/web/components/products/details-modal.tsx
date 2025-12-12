'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { formatCurrency } from '@/lib/utils';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

interface ProductDetailsModalProps {
  productId: string | null;
  isOpen: boolean;
  onClose: () => void;
}

const EditFormSchema = z.object({
  name: z.string().min(1, 'Required'),
  category_id: z.string().optional().nullable(),
  sku: z.string().optional().nullable(),
  upc: z.string().optional().nullable(),
  visible_in_kiosk: z.boolean().optional(),
  price_cents: z.number().optional().nullable(),
  cost_cents: z.number().optional().nullable(),
});

type EditFormData = z.infer<typeof EditFormSchema>;

export function ProductDetailsModal({
  productId,
  isOpen,
  onClose,
}: ProductDetailsModalProps) {
  const [isEditing, setIsEditing] = useState(false);
  const qc = useQueryClient();

  const { data: product, isLoading, isError, error, refetch } = useQuery({
    queryKey: ['product', productId],
    queryFn: () => (productId ? api.products.get(productId) : null),
    enabled: !!productId && isOpen,
  });

  // Fetch categories to resolve category name from category_id
  const { data: categories = [] } = useQuery({
    queryKey: ['categories'],
    queryFn: api.categories.list,
    enabled: !!productId && isOpen,
  });

  // Find category name based on category_id
  const categoryName = product?.category_id 
    ? categories.find((cat: { id: string; name: string }) => cat.id === product.category_id)?.name || '—'
    : '—';

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isDirty },
  } = useForm<EditFormData>({
    resolver: zodResolver(EditFormSchema),
    defaultValues: {
      name: '',
      category_id: '',
      sku: '',
      upc: '',
      visible_in_kiosk: false,
      price_cents: undefined,
      cost_cents: undefined,
    },
  });

  // Reset form when product data changes
  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        category_id: product.category_id ?? '',
        sku: product.sku ?? '',
        upc: product.upc ?? '',
        visible_in_kiosk: !!product.visible_in_kiosk,
        price_cents: product.price_cents ?? undefined,
        cost_cents: product.cost_cents ?? undefined,
      });
    }
  }, [product, reset]);

  // Reset editing state when modal closes
  useEffect(() => {
    if (!isOpen) {
      setIsEditing(false);
    }
  }, [isOpen]);

  const updateMutation = useMutation({
    mutationFn: (values: EditFormData) => {
      const apiPayload = {
        name: values.name,
        category_id: values.category_id || null,
        sku: values.sku || null,
        upc: values.upc || null,
        visible_in_kiosk: values.visible_in_kiosk,
        price_cents: 
          values.price_cents === null || values.price_cents === undefined || Number.isNaN(values.price_cents as number)
            ? null
            : values.price_cents,
        cost_cents: 
          values.cost_cents === null || values.cost_cents === undefined || Number.isNaN(values.cost_cents as number)
            ? null
            : values.cost_cents,
      };
      return api.products.update(productId!, apiPayload);
    },
    onSuccess: () => {
      toast.success('Product updated successfully');
      qc.invalidateQueries({ queryKey: ['products'] });
      qc.invalidateQueries({ queryKey: ['product', productId] });
      setIsEditing(false);
      refetch();
    },
    onError: (e: Error) => {
      toast.error('Failed to update product: ' + (e.message || 'Unknown error'));
    },
  });

  const handleSave = (values: EditFormData) => {
    updateMutation.mutate(values);
  };

  const handleCancel = () => {
    if (product) {
      reset({
        name: product.name,
        category_id: product.category_id ?? '',
        sku: product.sku ?? '',
        upc: product.upc ?? '',
        visible_in_kiosk: !!product.visible_in_kiosk,
        price_cents: product.price_cents ?? undefined,
        cost_cents: product.cost_cents ?? undefined,
      });
    }
    setIsEditing(false);
  };

  const visibleInKiosk = watch('visible_in_kiosk') ?? false;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>
              {isEditing ? 'Edit Product' : 'Product Details'}
            </DialogTitle>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
              >
                Edit
              </button>
            )}
          </div>
        </DialogHeader>
        
        <div className="space-y-4">
          {isLoading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2 text-gray-600">Loading product details...</p>
            </div>
          )}
          
          {isError && (
            <div className="text-center py-8">
              <p className="text-red-600">Error loading product details</p>
              <p className="text-sm text-gray-500 mt-1">{String(error)}</p>
            </div>
          )}
          
          {product && !isEditing && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Name
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  {product.name}
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Clover Item ID
                </label>
                <div className="p-3 bg-gray-50 rounded border text-xs font-mono">
                  {product.clover_item_id}
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Category
                  </label>
                  <div className="p-3 bg-gray-50 rounded border">
                    {categoryName}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Price
                  </label>
                  <div className="p-3 bg-gray-50 rounded border">
                    {product.price_cents ? formatCurrency(product.price_cents) : '—'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    SKU
                  </label>
                  <div className="p-3 bg-gray-50 rounded border text-sm">
                    {product.sku || '—'}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Cost
                  </label>
                  <div className="p-3 bg-gray-50 rounded border text-sm">
                    {product.cost_cents ? formatCurrency(product.cost_cents) : '—'}
                  </div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    UPC
                  </label>
                  <div className="p-3 bg-gray-50 rounded border text-sm">
                    {product.upc || '—'}
                  </div>
                </div>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Kiosk Visibility
                </label>
                <div className="p-3 bg-gray-50 rounded border">
                  <div className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                    product.visible_in_kiosk 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {product.visible_in_kiosk ? 'Visible' : 'Hidden'}
                  </div>
                </div>
              </div>
            </div>
          )}

          {product && isEditing && (
            <form onSubmit={handleSubmit(handleSave)} className="space-y-4">
              <div>
                <Label htmlFor="name">Name</Label>
                <Input id="name" {...register('name')} />
                {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category_id">Category</Label>
                    <Select
                      value={watch('category_id') ?? "__none__"}
                      onValueChange={value => setValue('category_id', value === "__none__" ? null : value, { shouldDirty: true })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {categories.map((cat: { id: string; name: string }) => (
                          <SelectItem key={cat.id} value={cat.id}>{cat.name}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                </div>
                <div>
                  <Label htmlFor="price_cents">Price (cents)</Label>
                  <Input
                    id="price_cents"
                    type="number"
                    inputMode="numeric"
                    {...register('price_cents', {
                      setValueAs: (v: string) =>
                        v === '' || v === null || v === undefined ? undefined : Number(v),
                    })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" {...register('sku')} />
                </div>
                <div>
                  <Label htmlFor="cost_cents">Cost (cents)</Label>
                  <Input
                    id="cost_cents"
                    type="number"
                    inputMode="numeric"
                    {...register('cost_cents', {
                      setValueAs: (v: string) =>
                        v === '' || v === null || v === undefined ? undefined : Number(v),
                    })}
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="upc">UPC</Label>
                <Input id="upc" {...register('upc')} />
              </div>

              <label className="flex items-center gap-3">
                <Switch
                  checked={visibleInKiosk}
                  onCheckedChange={(c) => setValue('visible_in_kiosk', c, { shouldDirty: true })}
                />
                <span>Visible in kiosk</span>
              </label>

              <div className="flex gap-2 pt-4 border-t">
                <button
                  type="submit"
                  disabled={updateMutation.isPending || !isDirty}
                  className="flex-1 bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {updateMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={updateMutation.isPending}
                  className="flex-1 bg-gray-500 text-white py-2 px-4 rounded hover:bg-gray-600 disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}