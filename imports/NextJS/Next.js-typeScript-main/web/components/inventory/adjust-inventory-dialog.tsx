'use client';

import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { api } from '@/lib/api';
import { InventoryRow, InventoryAdjustment } from '@/lib/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type AdjustmentForm = {
  adjustment: number;
  reason?: string;
};

interface AdjustInventoryDialogProps {
  item: InventoryRow;
  children: React.ReactNode;
}

export function AdjustInventoryDialog({ item, children }: AdjustInventoryDialogProps) {
  const [open, setOpen] = useState(false);
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm<AdjustmentForm>();

  const adjustMutation = useMutation({
    mutationFn: (adjustment: InventoryAdjustment) => api.inventory.adjust(adjustment),
    onSuccess: (response) => {
      if (response.success) {
        toast.success(response.message || 'Inventory adjusted successfully');
        queryClient.invalidateQueries({ queryKey: ['inventory'] });
        queryClient.invalidateQueries({ queryKey: ['inventory-low'] });
        setOpen(false);
        reset();
      } else {
        toast.error(response.message || 'Failed to adjust inventory');
      }
    },
    onError: (error) => {
      toast.error(error instanceof Error ? error.message : 'Failed to adjust inventory');
    },
  });

  const onSubmit = (data: AdjustmentForm) => {
    adjustMutation.mutate({
      clover_item_id: item.clover_item_id,
      adjustment: data.adjustment,
      reason: data.reason,
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Adjust Inventory</DialogTitle>
          <DialogDescription>
            Adjust inventory for {item.name || item.clover_item_id}. 
            Current quantity: <strong>{item.on_hand}</strong>
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="adjustment">Adjustment Amount</Label>
            <Input
              id="adjustment"
              type="number"
              step="1"
              placeholder="Enter adjustment (+ to add, - to subtract)"
              {...register('adjustment', { 
                required: 'Adjustment amount is required',
                valueAsNumber: true
              })}
            />
            {errors.adjustment && (
              <p className="text-sm text-destructive">{errors.adjustment.message}</p>
            )}
            <p className="text-xs text-muted-foreground">
              Use positive numbers to add inventory, negative to subtract
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="reason">Reason (optional)</Label>
            <Input
              id="reason"
              type="text"
              placeholder="e.g., Stock received, Damaged items, etc."
              {...register('reason')}
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setOpen(false);
                reset();
              }}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={adjustMutation.isPending}
            >
              {adjustMutation.isPending ? 'Adjusting...' : 'Adjust Inventory'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}