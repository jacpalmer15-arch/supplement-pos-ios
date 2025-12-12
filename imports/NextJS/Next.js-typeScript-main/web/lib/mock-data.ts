import { InventoryRow } from './types';

export const mockInventoryData: InventoryRow[] = [
  {
    clover_item_id: 'ITEM001',
    name: 'Coffee Beans - Premium Blend',
    on_hand: 25,
    reorder_level: 10,
  },
  {
    clover_item_id: 'ITEM002',
    name: 'Espresso Cups',
    on_hand: 5,
    reorder_level: 15,
    low_stock: true,
  },
  {
    clover_item_id: 'ITEM003',
    name: 'Sugar Packets',
    on_hand: 3,
    reorder_level: 20,
    low_stock: true,
  },
  {
    clover_item_id: 'ITEM004',
    name: 'Milk - Whole',
    on_hand: 8,
    reorder_level: 12,
    low_stock: true,
  },
  {
    clover_item_id: 'ITEM005',
    name: 'Pastries - Assorted',
    on_hand: 50,
    reorder_level: 20,
  },
  {
    clover_item_id: 'ITEM006',
    name: 'Tea Bags - Earl Grey',
    on_hand: 30,
    reorder_level: 15,
  },
];